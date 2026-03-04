# 市场页数据展示实现设计（tRPC + DataAccess）

## 1. 目标与范围

- **目标**：首页 `(market)/page.tsx`、Skills 页 `(market)/skills/page.tsx`、Personas 页 `(market)/personas/page.tsx` 的 Persona、Skill、MCP 数据改为通过 **tRPC 调用 DataAccess 访问数据库** 获取，不再使用前端静态数据（`@/lib/types` 中的 `personas`、`skills`）。
- **约束**：
  - 与 [MARKETPLACE_DB_REUSE_DESIGN.md](./MARKETPLACE_DB_REUSE_DESIGN.md) 一致：Persona/Skill/MCP 均复用 `apps` 表（`apps.type` = `persona` | `skill` | `client` | `server`），关联表 `persona_skills`、`persona_mcp_tools`、`skill_mcp_tools` 用于交叉展示。
  - **Persona、Skills、MCP 的 tRPC Router 分开**，便于维护与权限扩展。
  - **数据库访问层可复用**：同一套 DataAccess 可被多个 Router 使用，避免重复查询逻辑。
  - **状态管理清晰**：服务端状态由 React Query（tRPC 封装）管理；列表筛选、搜索等 UI 状态由组件本地 state 管理。

---

## 2. 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (apps/web)                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ (market)/   │  │ personas/   │  │ skills/     │              │
│  │ page.tsx    │  │ page.tsx    │  │ page.tsx    │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  PersonaSection   PersonasGrid    SkillGrid                       │
│  SkillsSection                    (filter/search 本地 state)     │
│  McpSections                                                      │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          ▼                                        │
│              trpc.marketplacePersonas.*                            │
│              trpc.marketplaceSkills.*                              │
│              trpc.marketplaceMcp.* (市场 MCP，与推荐逻辑分离)        │
└──────────────────────────┬──────────────────────────────────────┘
                            │
┌──────────────────────────▼──────────────────────────────────────┐
│  tRPC (packages/trpc)                                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │ marketplace      │ │ marketplace      │ │ marketplaceMcp   │ │
│  │ PersonasRouter   │ │ SkillsRouter     │ │ (市场列表，独立)   │ │
│  └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘ │
│           │                     │                     │           │
│           └─────────────────────┼─────────────────────┘           │
│                                 ▼                                 │
│                    database/web/marketplace.ts                    │
│                    （列表仅 SELECT 展示用字段，提高查询效率）         │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│  packages/db                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ database/web/marketplace.ts (新建)                            │ │
│  │ - listPersonasForMarket / listSkillsForMarket / listMcpForMarket │
│  │   各列表接口只查列表卡展示所需字段（见 3.2）                     │
│  │ - getPersonaById / getSkillById（详情可查全量）                 │
│  └─────────────────────────────────────────────────────────────┘ │
│  apps, categories, appCategories, appTags, tags,                  │
│  personaSkills, personaMcpTools, skillMcpTools                    │
└───────────────────────────────────────────────────────────────────┘
```

- **Router 分离**：`marketplacePersonas`、`marketplaceSkills`、`marketplaceMcp` 三者并列，市场页 MCP 使用 `marketplaceMcp`，与原有 `mcpRecommendations`（推荐位配置）逻辑分离；`mcpRecommendations` 仍可保留供其他「按推荐 ID 拉取」场景使用。
- **DataAccess 复用**：统一在 `marketplace.ts` 中按 `apps.type` 与过滤条件查询；**列表查询仅 SELECT 页面展示所需字段**，详情接口再按需查全量或关联表。

---

## 3. 数据访问层设计（packages/db）

### 3.1 新建文件 `packages/db/database/web/marketplace.ts`

**职责**：按 `apps.type` 列出市场可见的 Persona/Skill/MCP 应用，统一过滤条件（status、publishStatus、deleted）；**列表接口仅查询并返回列表卡展示所需字段**，以提升查询效率；详情接口按需查全量及关联表。

**接口一览**：

| 方法 | 说明 | 入参 | 返回 |
|------|------|------|------|
| `listPersonasForMarket` | Persona 列表（仅列表卡用字段） | `{ categorySlug?, tagSlug?, query?, limit?, offset? }` | `{ items: PersonaListRow[], total: number }` |
| `listSkillsForMarket` | Skill 列表（仅列表卡用字段） | 同上 | `{ items: SkillListRow[], total: number }` |
| `listMcpForMarket` | MCP 列表（仅列表卡用字段） | `{ type: 'client' \| 'server', categorySlug?, tagSlug?, query?, limit?, offset? }` | `{ items: McpListRow[], total: number }` |
| `getPersonaById` | 单个 Persona 详情（含关联 Skills、MCP） | `id: string` | `PersonaWithRelations \| null` |
| `getSkillById` | 单个 Skill 详情（含关联 MCP、被哪些 Personas 使用） | `id: string` | `SkillWithRelations \| null` |
| `getPersonaBySlug` | 按 slug 查 Persona 详情（同上，用于详情页 URL） | `slug: string` | `PersonaWithRelations \| null` |
| `getSkillBySlug` | 按 slug 查 Skill 详情（同上，用于详情页 URL） | `slug: string` | `SkillWithRelations \| null` |

**统一过滤条件**：`apps.status = 'approved'`、`apps.publishStatus = 'online'`、`apps.deleted = false`；categorySlug/tagSlug/query 与 3.2 中列表条件一致。

**详情关联数据**：为减少前端 N+1 请求，详情接口返回关联实体的**最小展示集**（仅 id、name、slug），供详情页渲染「相关 Skills / Personas / MCP」链接：
- Persona 详情：`skills: { id, name, slug }[]`、`mcpApps: { id, name, slug }[]`（不再仅返回 skillIds/mcpAppIds）。
- Skill 详情：`personas: { id, name, slug }[]`、`mcpApps: { id, name, slug }[]`。

### 3.2 列表查询字段最小化（提高查询效率）

列表页 SQL 只 SELECT 列表卡实际展示的列，避免 `SELECT *` 或过多大字段（如 readme、longDescription）。

**Persona 列表卡展示字段** → `PersonaListRow`（列表查询只查以下列）：

| 字段 | 来源 | 用途 |
|------|------|------|
| id | apps.id |  key、详情链接 |
| slug | apps.slug | 详情链接（若用 slug） |
| name | apps.name | 标题 |
| description | apps.description / descriptionZh | 描述 |
| features | apps.features | 卖点列表（前 3 条） |
| verified | apps.verified | 角标 |
| ownerName | apps.ownerName | 作者名 |
| category | categories: id, name, slug | 分类标签 |
| tags | tags: id, name（仅用于筛选时 join，或列表展示前几条） | 标签 |

不查：readme、readmeZh、longDescription、tools、banner、pics、github、website 等大字段及列表不需要的列。

**Skill 列表卡展示字段** → `SkillListRow`：

| 字段 | 来源 | 用途 |
|------|------|------|
| id, slug, name, description | apps | 标题与描述 |
| version | apps.version | 版本号 |
| verified, ownerName | apps | 角标与作者 |
| category | categories | 分类标签 |
| tags | tags (id, name) | 标签展示与筛选 |

**MCP 列表卡展示字段** → `McpListRow`：

| 字段 | 来源 | 用途 |
|------|------|------|
| id, slug, name | apps | 标题与链接 |
| icon, description, descriptionZh | apps | 图标与描述 |
| stars, contributors | apps | 星数、贡献者 |
| primaryLanguage, languages | apps | 语言标签 |
| createdAt | apps.createdAt | 日期 |
| tags | tags (id, name) | 标签 |

实现时：每个 list 方法内用 `db.select({ ... })` 只选上述列，再按需 leftJoin categories、appTags+tags，保证列表查询轻量。

### 3.3 导出与类型

- 在 `packages/db/database/web/index.ts` 中导出 `marketplaceDataAccess`（或命名一致的对象）。
- `PersonaListRow`、`SkillListRow`、`McpListRow` 可在 `marketplace.ts` 内用 TypeScript 类型或 zod 定义，供 tRPC 与前端复用。

---

## 4. tRPC Router 设计（Persona / Skills / MCP 分开）

### 4.1 新增 Router：`marketplacePersonas`

- **文件**：`packages/trpc/routers/web/marketplace-personas.ts`
- **Procedures**：
  - `list`：`input: { categorySlug?: string, tagSlug?: string, query?: string, limit?: number, offset?: number }`，内部调用 `marketplaceDataAccess.listPersonasForMarket(...)`，返回列表 + total。
  - `getById`：`input: { id: string }`，调用 `marketplaceDataAccess.getPersonaById(id)`，返回详情（含关联 Skills、MCP）。
  - `getBySlug`：`input: { slug: string }`，调用 `marketplaceDataAccess.getPersonaBySlug(slug)`，供详情页按 URL slug 拉取。
- **权限**：均为 `publicProcedure`，市场列表与详情对未登录用户可见。

### 4.2 新增 Router：`marketplaceSkills`

- **文件**：`packages/trpc/routers/web/marketplace-skills.ts`
- **Procedures**：
  - `list`：同上，内部调用 `marketplaceDataAccess.listSkillsForMarket(...)`。
  - `getById`：`input: { id: string }`，调用 `marketplaceDataAccess.getSkillById(id)`。
  - `getBySlug`：`input: { slug: string }`，调用 `marketplaceDataAccess.getSkillBySlug(slug)`，供详情页按 URL slug 拉取。
- **权限**：`publicProcedure`。

### 4.3 新增 Router：`marketplaceMcp`（与 mcpRecommendations 逻辑分离）

- **文件**：`packages/trpc/routers/web/marketplace-mcp.ts`
- **Procedures**：
  - `list`：`input: { type: 'client' | 'server', categorySlug?: string, tagSlug?: string, query?: string, limit?: number, offset?: number }`，内部调用 `marketplaceDataAccess.listMcpForMarket(...)`，返回 `{ items: McpListRow[], total: number }`。
- **权限**：`publicProcedure`。
- **与 mcpRecommendations 的关系**：市场页 MCP 列表统一走 `marketplaceMcp.list`（基于 `apps` 表 + 过滤条件，列表只返回展示用字段）；`mcpRecommendations` 保留给「按推荐配置 ID 拉取」等原有逻辑，与市场列表解耦。

### 4.4 挂载到 App Router

- 在 `packages/trpc/routers/_app.ts` 中：
  - 引入 `marketplacePersonasRouter`、`marketplaceSkillsRouter`、`marketplaceMcpRouter`；
  - 挂载为 `marketplacePersonas`、`marketplaceSkills`、`marketplaceMcp`。

---

## 5. 前端页面与状态管理

### 5.1 状态划分

- **服务端状态（由 tRPC/React Query 管理）**  
  - Persona 列表、Skill 列表、MCP 列表；Persona/Skill/MCP 详情。  
  - 列表使用 `trpc.marketplacePersonas.list.useQuery`、`trpc.marketplaceSkills.list.useQuery`、`trpc.marketplaceMcp.list.useQuery`，配置合理的 `staleTime`、`refetchOnWindowFocus`。
  - **详情由详情组件单独拉取与管理**：`PersonaDetail`、`SkillDetail` 内部分别使用 `getBySlug.useQuery`，MCP 详情页使用 `mcpApps.getBySlug.useQuery`（可在页面或 `McpDetail` 内），各组件自行处理 loading/error/空态，避免页面层与组件层状态重复。
- **客户端 UI 状态（组件本地 state）**  
  - Personas 页 / Skills 页的「分类筛选」「搜索框」：保留在 `PersonasGrid` / `SkillGrid` 内用 `useState`；筛选与搜索在前端对当页已拉取的列表做过滤（与当前静态数据时的行为一致），减少接口参数复杂度。若后续需要服务端搜索，再扩展 `list` 的 `query` 参数即可。

### 5.2 页面与组件改造

| 页面/组件 | 改造要点 |
|-----------|----------|
| **首页** `(market)/page.tsx` | 不直接改结构，仍由 `PersonaSection`、`SkillsSection`、`McpSections` 组成；这三个组件内部改为 tRPC 取数。 |
| **PersonaSection** | 使用 `trpc.marketplacePersonas.list.useQuery({ limit: 6 })`（或首页展示条数），用返回数据渲染卡片；loading/error 态参考现有 `McpSections`（Skeleton、Alert + 重试）。 |
| **SkillsSection** | 使用 `trpc.marketplaceSkills.list.useQuery({ limit: 6 })`，同上。 |
| **McpSections** | 改为 `trpc.marketplaceMcp.list.useQuery({ type: 'server', limit: 6 })`，与推荐逻辑分离，列表数据来自 marketplace 数据访问层。 |
| **Personas 页** `(market)/personas/page.tsx` | 仍渲染 `PersonasGrid`；`PersonasGrid` 内使用 `trpc.marketplacePersonas.list.useQuery({ limit: 100 })`（或不分页一次拉取），用返回数据 + 本地 `selected`/`searchQuery` 做筛选与搜索后渲染。 |
| **Skills 页** `(market)/skills/page.tsx` | 同理，`SkillGrid` 使用 `trpc.marketplaceSkills.list.useQuery`，本地筛选/搜索。 |
| **Persona 详情页** `(market)/personas/[slug]/page.tsx` | 路由参数为 `slug`。页面仅负责布局（SiteHeader、main、SiteFooter），将 `slug` 传给 `PersonaDetail`。**状态由组件单独管理**：`PersonaDetail` 内部使用 `trpc.marketplacePersonas.getBySlug.useQuery({ slug })`，自行处理 loading/error/空态，并将 API 返回映射为前端 `Persona` 展示。 |
| **Skill 详情页** `(market)/skills/[slug]/page.tsx` | 同上，`SkillDetail` 使用 `trpc.marketplaceSkills.getBySlug.useQuery({ slug })`，组件内管理加载/错误/空态与 DTO 映射。 |
| **MCP 详情页** `(market)/mcp/[slug]/page.tsx` | 继续使用现有 `trpc.mcpApps.getBySlug.useQuery({ slug })`（与市场列表 `marketplaceMcp.list` 分离）。页面内管理 loading/error，将数据传给 `McpDetail`；若需与 Persona/Skill 一致，可改为由 `McpDetail` 接收 `slug` 并在组件内 useQuery。 |

### 5.3 数据类型与 DTO 映射

- **列表项**：DataAccess 返回的 `AppWithCategoryAndTags` 已包含 `id, name, slug, description, descriptionZh, features, tools, category, tags, ownerName, verified, ...`；前端 Persona/Skill 卡片若当前依赖 `Persona` / `Skill` 类型（如 `price`、`authorInfo`、`subtitle`），可在 Router 层或前端做一层映射：
  - `price`：若表中暂无，可暂时写死 0 或从 `apps.tools` 的 JSON 中解析；
  - `authorInfo`：`{ name: ownerName, avatar: undefined }`；
  - `subtitle`：可用 `descriptionZh || description` 截断或留空。
- **分类**：Persona 的 category 当前为前端枚举（如 leadership、engineering）；若 DB 用 `categories.slug` 或 `categories.name`，需在映射层约定 slug/name 与前端 `PersonaCategory` 的对应关系，或逐步改为以服务端分类为准。
- **Skills**：同理，Skill 的 category 与前端 `SkillCategory` 对应；tags 由 `tags[]` 转为 `string[]`（tag.name）即可。

---

## 6. 实施步骤

1. **packages/db**
   - 新增 `database/web/marketplace.ts`，实现：
     - `listPersonasForMarket`、`listSkillsForMarket`、`listMcpForMarket`（**仅 SELECT 列表卡展示字段**，见 3.2）；
     - `getPersonaById`、`getSkillById`（详情可查全量及关联表）。
   - 在 `database/web/index.ts` 导出。

2. **packages/trpc**
   - 新增 `routers/web/marketplace-personas.ts`、`routers/web/marketplace-skills.ts`、`routers/web/marketplace-mcp.ts`，分别调用上述 list/getById 与 `listMcpForMarket`。
   - 在 `_app.ts` 挂载 `marketplacePersonas`、`marketplaceSkills`、`marketplaceMcp`。

3. **apps/web**
   - `PersonaSection`：改为 `trpc.marketplacePersonas.list.useQuery`，用返回数据渲染；补充 loading/error。
   - `SkillsSection`：改为 `trpc.marketplaceSkills.list.useQuery`。
   - `McpSections`：改为 `trpc.marketplaceMcp.list.useQuery({ type: 'server', limit: 6 })`，与 mcpRecommendations 解耦。
   - `PersonasGrid` / `SkillGrid`：改为对应 marketplace list useQuery，本地筛选/搜索。
   - 引入 DTO 映射：将 API 返回的 ListRow 映射为现有 `Persona`/`Skill`/卡片所需类型，保证卡片组件入参一致。

4. **详情页数据访问与状态**
   - Persona/Skill 详情页路由为 `[slug]`，使用 `getBySlug` 拉取数据。
   - 详情组件（PersonaDetail、SkillDetail）内部使用 `getBySlug.useQuery`，**单独管理** loading/error/空态，并与列表页一样只依赖 tRPC 返回的 DTO；前端在组件内将 API 返回映射为现有 `Persona`/`Skill` 展示类型（如 category、tags、authorInfo）。
   - 列表查询已按 3.2 只 SELECT 列表卡展示字段，保持列表查询高效；详情接口按需查全量及关联最小集（id、name、slug）。

5. **可选**
   - 首页 Personas/Skills/MCP 数量徽章由 `list` 的 `total` 或单独 `count` procedure 提供。
   - 需要服务端 generateMetadata 时，可在服务端调用 `marketplaceDataAccess.getPersonaBySlug`/`getSkillBySlug` 或 tRPC caller 拉取标题与描述。

---

## 7. 小结

- **Router**：Persona、Skills、MCP 三者分开，市场页统一使用 `marketplacePersonas`、`marketplaceSkills`、`marketplaceMcp`；MCP 与原有 `mcpRecommendations` 逻辑分离，市场列表走 `marketplaceMcp.list`。
- **数据访问**：统一在 `packages/db/database/web/marketplace.ts`；**列表查询只取列表卡展示所需字段**，提高查询效率；详情接口再按需查全量及关联表。
- **状态**：服务端状态由 tRPC + React Query 管理；列表页的筛选/搜索为客户端状态，对当页数据做前端过滤。
