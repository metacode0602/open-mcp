# OpenMCP 市场与商业模式设计方案

## 一、概述与定位

**产品定位**：AI 助手的应用商店（The app store for AI assistants）

**两条业务线**：

| 业务线 | 定价模式 | 目标客户 |
|--------|----------|----------|
| **Clawsourcing（定制服务）** | $2,000 一次性设置费 + $500/月 维护费 | 中大型企业，需要深度定制和托管服务 |
| **Marketplace（数字市场）** | 单品付费，创作者定价 | 技术型个人用户、小型团队、DIY 用户 |
| **创作者分成** | 平台抽成 10%（创作者得 90%） | AI 配置专家、高级用户 |

**市场商品形态**：

- **Persona（角色配置包）**：包装为「虚拟员工」，有形象、角色定位、完整工作能力描述（个性、记忆系统、决策框架、工具设置）。
- **Skill（技能包）**：即插即用的技术组件，侧重功能实现与架构（如邮件安全、社交媒体自动化、代码监控等）。
- **MCP**：维持原有设计，与 Skills 一样作为 Persona 工作能力的一部分，不单独作为市场商品类目。

---

## 二、当前 (market) 页面与数据现状

### 2.1 路由与页面

- **`/`**：首页，含 HeroSection、StatsSection、**PersonaSection**（用 `personas` 数据）、**PersonasGrid**（实际渲染 **usecases**）、FeaturedCreators、HowItWorks、ClawsourcingPreview、CreatorCta、Cta。
- **`/personas`**：标题为「AI 员工配置包」，但 **PersonasGrid 使用的是 usecases + UsecaseCard**，即当前展示的是「用例」列表而非「Persona」列表。
- **`/personas/[id]`**：使用 **getUsecaseById** + **UsecaseDetail**，展示的是 UseCase 详情；且引用了未导入的 `SiteHeader` / `SiteFooter`（与 layout 重复，存在实现问题）。
- **`/skills`**、**`/skills/[id]`**、**`/skills/submit`**：Skills 列表、详情、提交，数据来自 `@/lib/types` 的 `skills`；Skill 详情中有「相关案例」链接到 **`/usecase/${uc.id}`**（与 (market) 下实际路由 `/personas/[id]` 不一致）。
- **`/clawsourcing`**、**`/contribute`**：定制服务与贡献指南。

### 2.2 类型与数据源

- **Persona**（`personas.ts`）：id, name, subtitle, description, category（leadership | engineering | marketing | support | operations）, tags, author, authorInfo, features, verified, price。用于首页 PersonaSection。
- **UseCase**（`usecases.ts`）：id, title, description, category（social | creative | efficiency | knowledge）, difficulty, tags, scenario, steps, configSnippet, effect, author, authorInfo, githubStats?, skillIds?, i18n?, verified, lang。用于 PersonasGrid、personas/[id]、以及 Skill 的「相关案例」。
- **Skill**（`skills.ts`）：id, name, description, longDescription, category, version, tags, author, authorInfo, githubStats?, installCommand?, configExample?, **usecaseIds?**, i18n?, verified, price?。Skill 通过 usecaseIds 关联 UseCase。

结论：**当前「AI 员工」列表与详情实质是 UseCase，Persona 仅在首页区块展示；两套概念并存且路由/链接不统一。**

---

## 三、合并 Usecases 与 Persona 的设计方案（保留 Persona 定义）

### 3.1 原则

- **以 Persona 为唯一「AI 员工配置包」商品形态**，对外统一为「虚拟员工」叙事。
- **Usecase 不再作为独立商品类目与列表**，其内容合并进 Persona 或作为 Persona 的附属信息。

### 3.2 合并策略（二选一或组合）

**方案 A：Persona 吸纳 UseCase 字段（推荐）**

- 保留并扩展 `Persona` 类型，增加可选字段以承载「工作流/实现」信息：
  - `scenario?: string` — 使用场景描述（对应原 UseCase.scenario）
  - `steps?: string[]` — 实现步骤（对应原 UseCase.steps）
  - `configSnippet?: string` — 配置示例（对应原 UseCase.configSnippet）
  - `effect?: string` — 效果说明（对应原 UseCase.effect）
  - `difficulty?: "beginner" | "intermediate" | "advanced"`
  - `skillIds?: string[]` — 关联的 Skill 列表（与 MCP 一起构成「工作能力」）
  - `githubStats?: GithubStats`、`i18n?: I18nContent` 等按需迁移
- 原 usecases 数据：**迁移为 Persona 条目**（每个 UseCase 转为一个 Persona，title → name/subtitle，补充 persona 特有字段如 category 映射、features 从 steps/effect 提炼）。
- 原 personas 数据：保留，与迁移后的「由 UseCase 转成的 Persona」合并为同一 Persona 列表。
- 前端：**`/personas` 只展示 Persona**，卡片与详情均基于 Persona 类型；删除对 UseCase 列表/详情的直接展示。


采用 **方案 A**，单一数据模型、迁移简单、列表/详情统一用 Persona，Skill 侧「相关案例」改为「相关 Persona」（或「使用该 Skill 的 AI 员工」），链接到 `/personas/[id]`。

### 3.3 分类统一

- 当前 Persona 分类：leadership, engineering, marketing, support, operations。
- 当前 UseCase 分类：social, creative, efficiency, knowledge。
- **合并后**：建议以 Persona 分类为主（领导力/工程/营销/支持/运营），原 UseCase 的 category 可映射到上述之一，或扩展 Persona 的 category 枚举以覆盖「社交/创意/效率/知识」等标签，便于筛选与 SEO。

### 3.4 路由与链接

- **`/personas`**：Persona 列表（数据源改为 personas，不再用 usecases）。
- **`/personas/[id]`**：Persona 详情（数据源 getPersonaById，组件为 PersonaDetail；移除对 SiteHeader/SiteFooter 的重复引用，依赖 layout）。
- **卡片/详情内链接**：所有原「案例」链接统一为 **`/personas/[id]`**；Skill 详情页「相关案例」改为「使用该 Skill 的 AI 员工」并指向 **`/personas/[id]`**。
- **不再保留** `/usecase` 或 `/usecase/[id]` 作为市场商品路由（若别处有引用需改为 /personas）。

### 3.5 Skill 与 Persona 的关系

- Skill 继续作为独立商品类型，拥有自己的列表/详情/提交。
- **Persona 与 Skill**：Persona 通过 **skillIds**（以及未来的 MCP 配置）描述「工作能力」；Skill 侧可保留 **personaIds**（或由 skillIds 反查）用于展示「使用该 Skill 的 Persona」，链接到 `/personas/[id]`。
- MCP 仍为 Persona 能力的一部分，不在市场单独成类。

---

## 四、数据库（mcp-schema）与当前设计的匹配度

### 4.1 当前 schema 概览

- **已有**：apps, tags, categories, appTags, appCategories, suggestions, claims, ads, **payments**, **invoices**, activities, recommendations, recommendationApps, relatedApps, appAnalysisHistory, emailSubscriptions, appRss, rssItems, appSubmissions, assets, rankings, rankingRecords, snapshots, repos, hallOfFame 等。
- **payments**：type 为 `ad | subscription | service | other`，relatedId, amount, currency, method, status 等，**无 marketplace 商品类型与创作者分成字段**。
- **无**：personas 表、skills 表、marketplace 订单/购买记录、创作者收入/分成、Clawsourcing 合同或工单表。

即：**当前市场（Personas、Skills、Usecases）完全依赖前端静态数据（lib/types），数据库尚未支持「AI 助手应用商店」的商品、交易与分成。**

### 4.2 为支持商业模式所需的数据模型补充

以下为**建议新增或扩展**，不在本阶段改代码，仅作设计确认。

**1. 市场商品与发布**

- **personas 表**：id, slug, name, subtitle, description, category, tags[], author_id (FK users), features[], scenario, steps[], config_snippet, effect, difficulty, skill_ids[], mcp_config (jsonb), price_cents, currency, verified, status (draft|published|archived), published_at, created_at, updated_at 等。
- **skills 表**：id, slug, name, description, long_description, category, version, tags[], author_id, install_command, config_example, persona_ids[]（或关联表）, price_cents, verified, status, published_at, created_at, updated_at 等。
- 若希望统一「可售数字商品」，可考虑 **marketplace_products** 表 + product_type (persona|skill)，与 personas/skills 一对一；或直接以 personas + skills 为商品主体。

**2. 购买与订单**

- **marketplace_orders**（或 orders）：id, user_id, product_type (persona|skill), product_id, amount_cents, currency, platform_fee_cents, creator_earnings_cents, status (pending|completed|refunded), paid_at, created_at。
- 或扩展现有 **payments**：type 增加 `marketplace_persona | marketplace_skill`，related_id 存 persona_id/skill_id，并增加 creator_id、platform_fee、creator_earnings 等字段。

**3. 创作者分成**

- **creator_earnings**（或集成在 orders）：order_id, creator_id, amount_cents, status (pending|paid), paid_at。
- 或仅在 orders 中记录 creator_earnings_cents 与 creator_id，月结时再生成 payout 记录。

**4. Clawsourcing**

- **clawsourcing_contracts**（或 engagements）：id, company_id/user_id, status (lead|active|closed), setup_fee_paid_at, monthly_fee_cents, next_billing_at, metadata (jsonb) 等。
- 与现有 **payments**（type=service）可关联，用于记录 $2000 与 $500/月 的流水。

**5. 用户与创作者**

- 创作者可与现有 **users** 关联；personas/skills 的 author_id 指向 users.id；若尚未有「创作者档案」，可增加 creator_profiles 或复用 users 扩展字段。

### 4.3 小结

- **当前设计**：无法满足「Persona/Skill 上架、购买、平台抽成 10%、创作者 90%」的闭环；需新增商品表、订单/支付扩展、分成记录。
- **实现顺序建议**：先确认 Persona 与 UseCase 合并方案与前端路由 → 再落地 personas/skills 表与 API → 再接入支付与分成。

---

## 五、商业模式设计完善

### 5.1 Clawsourcing（定制服务）

- **定价**：$2,000 一次性设置费 + $500/月 维护费。
- **服务内容**：端到端定制 AI 员工、持续优化、跨客户学习成果共享（脱敏）。
- **数据**：合同/客户、收费节点、与 payments 的关联需在 schema 中体现（见 4.2）。

### 5.2 Marketplace（数字市场）

- **定价**：单品付费，**创作者自主定价**；平台不代定价，仅做建议或区间约束（可选）。
- **分成**：平台 10%，创作者 90%；在订单/支付层记录 platform_fee 与 creator_earnings。
- **发布**：支持 **API 发布**，**无需审核队列**（即提交即上架，或仅做基础合规校验）；若后续需要「审核」可加 status：draft → pending_review → published。
- **安装体验**：购买后几分钟内完成安装（产品与文档需支持一键/脚本安装）。

### 5.3 创作者

- **角色**：AI 配置专家、实际运营 AI 助手的「操作员」。
- **收益**：90% 收入分成；需支持提现与报表（依赖 creator_earnings / payouts）。
- **合规**：若支持 API 发布且无审核队列，需在条款中明确创作者责任与平台免责范围。

### 5.4 产品形态再确认

- **Persona**：虚拟员工，形象 + 角色 + 工作能力（个性、记忆、决策框架、工具/MCP/Skills）；合并 UseCase 后具备 scenario/steps/config 等「实现细节」。
- **Skill**：技术组件，即插即用；与 Persona 通过 skillIds / personaIds 关联；MCP 作为能力的一部分不单独成类。

---

## 六、后续实现清单（确认后再编码）

1. **类型与数据**
   - 确定 Persona 扩展字段（scenario, steps, configSnippet, effect, difficulty, skillIds 等），合并 usecases 数据到 Persona 列表。
   - 统一 Persona 与 UseCase 的 category 枚举或映射。
   - Skill 的「相关案例」改为「相关 Persona」，并维护 personaIds 或通过 skillIds 反查。

2. **前端 (market)**
   - `/personas`：数据源改为 personas，卡片改为 PersonaCard（基于 Persona 类型）。
   - `/personas/[id]`：数据源改为 getPersonaById，详情组件改为 PersonaDetail；移除重复的 SiteHeader/SiteFooter，使用 layout。
   - 所有原 usecase 链接改为 `/personas/[id]`（含 personas-card 的 href、skill-detail 的「相关案例」链接）。
   - 删除或废弃对 UseCase 列表/详情的单独展示；可选保留 usecases 类型用于后台或迁移脚本。

3. **数据库**
   - 新增 personas、skills 表（及必要关联表）；设计 marketplace_orders 或扩展 payments；设计 creator_earnings / payouts；Clawsourcing 合同表按需添加。
   - 迁移脚本：将现有静态 personas + 迁移后的 usecases → DB personas；静态 skills → DB skills。

4. **API 与支付**
   - 商品 CRUD、购买、回调、分成计算与记录；Clawsourcing 合同与续费；创作者报表与提现（可二期）。

5. **文案与导航**
   - 全站统一「AI 员工」「Personas」「Skills」用语；metadata 与面包屑从「OpenClaw Usecases」改为与「OpenMCP / AI Assistant Store」一致。

---

## 七、文档修订与确认

- 本文档为**设计与方案说明**，不包含具体代码修改。
- 确认合并方案（推荐方案 A）、分类与路由、DB 表结构后，再按「六、后续实现清单」分步实现代码。
