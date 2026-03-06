# Tags / Categories 与 type 限制——设计分析与产品决策

## 产品决策（已采纳）

- **分类形态**：采用**统一分类**。全商店共用一套分类体系（如「效率」「创作」「开发」「客服」等），Persona、Skill、MCP 等均可选用同一批分类，不再按应用类型拆分多棵分类树。
- **apps.type**：**保留**。继续用于区分实体形态（Persona / Skill / MCP client/server / 应用），支撑路由、关联关系与计费。
- **tags.type**：**逐步废弃**。标签与应用类型解耦，全类型通用；现有 `tags.type` 列保留但不作为业务逻辑依据，新建/编辑统一视为通用标签。
- **categories 的“按 type 区分”**：**逐步废弃**。不再通过「父级 slug = app type」区分各形态的分类树；改为**一棵统一分类树**（或按业务语义的单一维度划分），所有 app type 共用。

本文档其余部分为背景、现状与落地要点，供后续实现与迁移时参考；**暂不修改代码**，仅更新设计文档。

---

## 1. 背景与当前设计概览

### 1.1 背景

当前设计中，**tags** 和 **categories** 都与「类型」有关联。若产品定位是**统一的 AI 助手应用商店**，需明确这类按 type 的区分是否保留。

### 1.2 当前设计概览

| 对象 | 与 type 的关系 | 在代码中的使用 |
|------|----------------|----------------|
| **apps** | `apps.type` = client \| server \| application \| skill \| persona | 列表/详情筛选、路由、关联表约束、排行等，**强依赖**。 |
| **tags** | `tags.type` = client \| server \| application \| all（默认 all） | 仅在 rankings 等少数处透出给前端，**几乎未用于筛选**。 |
| **categories** | 无 type 列；父级 slug = type，子分类按父级归属 | `getCategoriesByType(type)`、`getChildrenByParentSlug(parentSlug)`，用于各「频道」下的分类树。 |

---

## 2. 已采纳方案说明

### 2.1 apps.type —— 保留

- **作用**：区分「这是什么形态的商品/应用」（Persona、Skill、MCP client/server、普通 AI 应用）。
- **保留原因**：路由与入口（/personas、/skills、/tools）、Persona–Skill / Persona–MCP / Skill–MCP 关联表、展示与计费均依赖实体类型，为核心建模，不因统一商店而取消。

### 2.2 tags.type —— 逐步废弃

- **当前含义**：该标签「适用于」哪类应用（client / server / application），或 `all` 表示通用。
- **决策**：标签体系**全类型通用**，不再按 app type 限制。同一标签（如「写作」「翻译」）可同时用于 Persona、Skill、MCP。
- **实施方式**：
  - **schema**：`tags.type` 列**暂不删**，保持兼容；新建/编辑标签时统一写为 `'all'` 或不再依赖该字段。
  - **查询与接口**：所有「按 tag 查 app」或「按 app 查 tag」的接口**不再**以 `tags.type` 作为筛选条件。
  - **前端/运营**：不再按 tag type 做 Tab 或筛选，改为「全部标签」或按其他维度（如 source）区分。
  - **后续**：待全量迁移与验证后，可将该列标记为废弃（文档注明），或在下一个大版本中移除。

### 2.3 categories 的“按 type 区分”—— 逐步废弃，改为统一分类

- **当前设计**：categories 通过**父级 slug = app type**（client / server / application / persona / skill）得到「某类型下的分类树」。
- **决策**：采用**统一分类**——全站一棵分类树（或按业务语义的单一维度划分），不按 app type 分父节点；Persona、Skill、MCP 等均可选同一批分类。
- **实施方式**：
  - **数据与接口**：提供「全类型可用」的**统一分类树**接口；按分类 slug 查子分类时**不再**强制传入 app type。逐步弱化或替换 `getCategoriesByType(type)`、`getChildrenByParentSlug(parentSlug)` 等「按 type 取分类」的用法。
  - **层级**：若需保留多级分类，用**业务语义**划分（如「市场展示用分类」的根节点），而非用 app type 作为根。
  - **数据迁移**：现有数据若强依赖「父级 slug = client/server/application/persona/skill」，需在实现阶段规划迁移（例如：新增统一根节点、将现有子分类挂到统一树下，或兼容双入口过渡期）。具体迁移步骤在实现时再写进实现文档。

---

## 3. 落地与迁移要点（实现时执行）

以下为后续**修改代码与数据**时的要点，当前仅作设计记录，**暂不修改代码**。

### 3.1 tags

- 新建/更新标签时统一为 `type = 'all'`（或不再写入 type）。
- 所有「按 tag 查 app」或「按 app 查 tag」的接口去掉对 `tags.type` 的条件。
- 前端/运营后台不再按 tag type 做 Tab 或筛选。

### 3.2 categories

- 提供「全类型可用」的**统一分类树**接口；按「分类 slug」查子分类时不再强制传 app type。
- 弱化或替换 `getCategoriesByType(type)`、按 `getChildrenByParentSlug(persona|skill|...)` 的按 type 取分类逻辑；改为基于统一树或统一根。
- 数据迁移：评估现有「父级 slug = type」数据，规划统一根节点与子分类归属，必要时做兼容过渡。

### 3.3 小结表

| 对象 | 决策 | 说明 |
|------|------|------|
| **apps.type** | ✅ 保留 | 实体类型是核心，路由、关联、计费都依赖。 |
| **tags.type** | ❌ 逐步废弃 | 标签全类型通用；列可暂保留，逻辑与接口不再依赖。 |
| **categories 按 type 区分** | ❌ 逐步废弃 | 采用统一分类树，不再按 app type 分父节点。 |

---

在「AI 助手应用商店」且**采用统一分类**的形态下，仅保留 **apps.type** 作为实体类型维度；**tags.type** 与 **categories 的 type 关联** 逐步废弃，以统一标签与分类体系，便于跨类型检索与运营。代码与数据迁移在实现阶段按本文档执行。
