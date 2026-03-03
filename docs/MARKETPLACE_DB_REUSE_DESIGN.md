## OpenMCP 市场与数据库复用设计（基于现有表）

### 1. 目标与约束

- **目标**：在现有数据库设计基础上，支持「AI 助手应用商店」的业务，包括 Persona、Skill、MCP 工具、订单、支付和创作者分成。
- **约束**：
  - **MCP 工具 = 现有 `apps` 表中的应用**，保持既有设计不变。
  - **不额外创建新的实体表来存 Persona / Skill / MCP**，尽量复用 `apps`、`tags`、`categories` 等。
  - 订单与支付分工明确：**订单表保存用户购买记录，`payments` 表保存支付流水与结果**。
  - 创作者需要 **绑定收款账户**，并通过 **支付 100 元** 成为创作者。

> 说明：在上述约束下，商品与 MCP 均通过扩展 `apps.type`（skill / persona / application）复用现有表；新增表包括：**订单表**、**用户账户表**（站内余额）、**提现记录表**，以及 **Persona–Skill、Persona–MCP、Skill–MCP 关联表**（用于页面交叉展示与双向查询）；其余（创作者身份、收款信息）通过 `users` 扩展字段与 `payments` 复用实现。

---

### 2. 商品与 MCP 的数据建模（全部复用 `apps` 系列表）

#### 2.1 通过 `apps.type` 区分商品类型

现有 `apps` 表已有 `type` 字段，取值为 `client | server | application`。扩展该枚举即可区分市场商品与 MCP 工具，**无需新增实体表**。

**扩展后的 `apps.type` 约定**：

| type 取值       | 含义           | 说明 |
|-----------------|----------------|------|
| `client`        | MCP 客户端     | 现有含义，MCP 工具的一种。 |
| `server`        | MCP 服务端     | 现有含义，MCP 工具的一种。 |
| `application`   | AI 应用        | 可独立运行的 AI 应用（非市场可售的 Persona/Skill 形态）。 |
| `skill`         | 技能包         | 市场可售的 Skill 商品，即插即用功能模块。 |
| `persona`       | 角色配置包     | 市场可售的 Persona 商品，虚拟员工配置。 |

即：

- **`type = "skill"`** → 表示该条 `apps` 记录是一个 **Skill**。
- **`type = "persona"`** → 表示该条 `apps` 记录是一个 **Persona**。
- **`type = "application"`** → 表示是一个 **AI 应用**（非以 Persona/Skill 形态在市场上架的商品）。

现有 `apps` 其他字段继续复用：

- 基础信息：`id, slug, name, description, descriptionZh, longDescription, readme, readmeZh`
- 分类：`categoryId`、`categories` / `appCategories`
- 元数据：`features text[]`, `tools jsonb`, `scenario varchar`，以及 GitHub 相关字段
- 所有者：`ownerId`, `ownerName`, `userId`, `verified`

**Skill（type = "skill"）**：

- 在 `apps.tools` 中可存放依赖的 MCP 工具列表（如 `{ mcpAppIds: string[] }`），对应 `apps.id`（type 为 client/server 等）。

**Persona（type = "persona"）**：

- `features`：展示给用户的卖点（对应前端 personas 的 features）。
- `tools`：结构化描述角色配置与能力，例如：

  ```json
  {
    "role": "AI CEO",
    "memory": { "strategy": "long-term" },
    "decisionFramework": { "type": "raci" },
    "skillIds": ["app_skill_xxx"],
    "mcpAppIds": ["app_mcp_yyy"]
  }
  ```

- Persona 依赖的 Skill 与 MCP 在**页面展示时需要交叉查询**（如：Persona 详情展示「使用的 Skills」、Skill 详情展示「被哪些 Personas 使用」、MCP 工具页展示「被哪些 Personas/Skills 使用」），仅用 `apps.tools` 的 JSON 难以高效做反向查询与列表展示，因此 **需新增关联表**（见 2.3）。

**小结**：所有可售内容（Persona、Skill）与 MCP 工具、AI 应用均在同一张 `apps` 表中，仅通过 **`type`** 区分；前端 TS 类型（`personas.ts`, `skills.ts`）可视为对 `type = persona | skill` 的 `apps` 的视图/转换。

#### 2.2 MCP 工具与 Persona 能力（概念）

- **MCP 工具**：继续使用 `apps` 表中 `type = "client" | "server"` 的记录。
- **Persona 能力**：由 Skill（`type = "skill"` 的 `apps`）与 MCP 工具（`type = "client"|"server"` 的 `apps`）组成；具体关联关系存入**关联表**（2.3），便于双向查询与页面交叉展示。`apps.tools` 仍可保留一份 JSON 快照（与关联表同步），用于配置下发或展示顺序等。

#### 2.3 Persona–Skill 与 Persona–MCP、Skill–MCP 关联表（新增）

因页面存在**交叉展示**（Persona 页展示「使用的 Skills / MCP」、Skill 页展示「被哪些 Personas 使用」、MCP 页展示「被哪些 Personas/Skills 使用」），需用**关联表**做多对多关系与索引查询，避免解析 JSON 和全表扫描。

**1. Persona–Skill 关联表**

- **表名**：`persona_skills`（或 `app_persona_skills`）。
- **含义**：某 Persona 使用了哪些 Skill（多对多）。
- **字段建议**：
  - `id`：主键。
  - `personaId`：Persona 应用 id，`apps.id`（且对应 `apps.type = 'persona'`）。
  - `skillId`：Skill 应用 id，`apps.id`（且对应 `apps.type = 'skill'`）。
  - `sortOrder`：可选，同一 Persona 下多个 Skill 的展示顺序。
  - `createdAt`：创建时间。
- **约束**：唯一约束 `(personaId, skillId)`；外键指向 `apps(id)`。
- **页面用途**：
  - Persona 详情/列表：查该 Persona 关联的 Skills（`personaId = ?`）。
  - Skill 详情/列表：查使用该 Skill 的 Personas（`skillId = ?`）。

**2. Persona–MCP 工具关联表**

- **表名**：`persona_mcp_tools`（或 `app_persona_mcp_tools`）。
- **含义**：某 Persona 使用了哪些 MCP 工具（多对多）。
- **字段建议**：
  - `id`：主键。
  - `personaId`：Persona 应用 id，`apps.id`（`apps.type = 'persona'`）。
  - `mcpAppId`：MCP 应用 id，`apps.id`（`apps.type` 为 `client` 或 `server`）。
  - `sortOrder`：可选，展示顺序。
  - `createdAt`：创建时间。
- **约束**：唯一约束 `(personaId, mcpAppId)`；外键指向 `apps(id)`。
- **页面用途**：
  - Persona 详情/列表：查该 Persona 关联的 MCP 工具（`personaId = ?`）。
  - MCP 工具详情/列表：查使用该 MCP 的 Personas（`mcpAppId = ?`）。

**3. Skill–MCP 工具关联表（可选，建议增加）**

- **表名**：`skill_mcp_tools`（或 `app_skill_mcp_tools`）。
- **含义**：某 Skill 依赖哪些 MCP 工具（多对多）。
- **字段建议**：
  - `id`：主键。
  - `skillId`：Skill 应用 id，`apps.id`（`apps.type = 'skill'`）。
  - `mcpAppId`：MCP 应用 id，`apps.id`（`apps.type` 为 `client` 或 `server`）。
  - `sortOrder`：可选。
  - `createdAt`：创建时间。
- **约束**：唯一约束 `(skillId, mcpAppId)`；外键指向 `apps(id)`。
- **页面用途**：
  - Skill 详情：展示「依赖的 MCP 工具」；MCP 工具页：展示「被哪些 Skills 使用」。

**数据一致性**：创建/更新 Persona 或 Skill 时，同步维护对应关联表；若仍保留 `apps.tools` 中的 `skillIds` / `mcpAppIds`，需与关联表一致（以关联表为准，`apps.tools` 可作为导出或展示用快照）。

---

### 3. 订单与支付：订单表 + 复用 `payments`

#### 3.1 职责划分

- **订单表（order）**：记录「用户买了什么」，包括商品类型（Persona / Skill / 创作者资格）、单价、分成金额等，与支付渠道无关。
- **`payments` 表**：记录「这笔钱是如何被支付的」，包括支付渠道（微信/支付宝/转账）、状态（pending/completed/failed/refunded）、第三方交易号等。

即：

- 订单回答 **“买了什么、多少钱、谁收谁付”**；
- 支付回答 **“通过什么方式，是否成功，什么时候成功”**。

#### 3.2 订单表设计（新增一张表）

> 对应你在 `MARKETPLACE_AND_BUSINESS_DESIGN.md:109-113` 中的设想，这里给出更具体的结构。  
> 命名示例：简化为 `orders`。

核心字段建议：

- `id`：订单 ID（主键）。
- `userId`：购买人，对应 `users.id`。
- `appId`：购买的商品，对应 `apps.id`（Persona 或 Skill；创作者资格订单可为空）。
- `appMeta`：**商品快照（jsonb）**。下单时保存当前 `appId` 对应的展示用信息，便于订单列表/详情等页面直接展示「买了什么」，无需再查 `apps` 或应对商品后续改名、下架等情况。建议包含例如：`name`, `slug`, `icon`, `productType`, `ownerName` 等；结构由实现约定。
- `productType`：`persona | skill | creator_membership`。其中 `persona` / `skill` 可与 `apps.type` 一致；显式存一份便于查询与统计。
- `amountCents`：订单总金额（单位：分，含税价）。
- `currency`：币种（例如 `CNY`）。
- `platformFeeCents`：平台抽成金额（10%）。
- `creatorEarningsCents`：创作者分成金额（90%；创作者资格订单为 0）。
- `creatorId`：收款的创作者，对应 `users.id`（可与 `apps.ownerId` 一致；创作者资格订单可为空）。
- `status`：`pending | completed | refunded | cancelled`。
- `paidAt`：实际支付完成时间（成功时写入）。
- `createdAt`, `updatedAt`：创建/更新时间。

该表只负责**业务级订单语义**，一笔订单可能对应一条或多条 `payments` 流水（例如补差价、退款等）。

#### 3.3 复用 `payments` 表

现有 `payments` 结构（简要）：

- `id, userId, type, relatedId, amount, currency, method, status, transactionId, invoiceNumber, metadata, createdAt, updatedAt, ...`

复用方案：

- **扩展 `type` 枚举**（而不是新建表）：
  - 增加 `marketplace_order`（普通 Persona/Skill 订单支付）。
  - 增加 `creator_onboarding`（创作者资格 100 元支付）。
  - 如有需要，可增加 `creator_payout`（给创作者打款，可选）。
- **`relatedId` 用来关联订单或其他业务对象**：
  - 当 `type = "marketplace_order"` 时，`relatedId = orders.id`。
  - 当 `type = "creator_onboarding"` 时，`relatedId = users.id`（或专门的订单）。
  - 当 `type = "creator_payout"` 时，`relatedId = withdrawals.id`（见下文提现记录表）。
- 支付渠道、交易号、失败原因等，依旧只在 `payments` 中维护，通过 `status` 与订单的 `status` 建立状态机映射即可。

#### 3.4 用户账户表（创作者站内余额）

业务要求创作者收入**必须先沉淀在站内、再按需提现**，因此 **必须新增用户账户表**，用于保存创作者当期的站内过户余额。

**表名示例**： `user_balances`。

**核心字段建议**：

- `id`：主键。
- `userId`：对应用户，`users.id`（通常仅创作者有余额，但表可设计为通用「用户账户」）。
- `balanceCents`：当前余额（单位：分），非负。
- `currency`：币种（如 `CNY`）。
- `version` 或 `updatedAt`：乐观锁/更新时间，便于并发扣减时校验。

**与业务的联动**：

- **订单完成**：在 `orders` 中 `status = completed` 且 `creatorEarningsCents > 0` 时，对 `creatorId` 对应的 `user_accounts` 做 **增加余额**（`balanceCents += creatorEarningsCents`）。可选：同时写入一条「入账」流水（见下）。
- **提现申请**：从 `user_accounts` 扣减相应金额，并插入一条 **提现记录**（见 3.5）；打款成功后由 `payments` 记录支付结果。
- **退款**：若订单退款，需从创作者账户扣回已入账的 `creatorEarningsCents`（余额不足时可记欠款或限制退款策略）。

**业务要求**：**必须**采用「创作者收入先沉淀在站内、再按需提现」：订单完成后先将分成入账到用户账户表，创作者再发起提现。用户账户表为**必选**，不可省略；用于清晰区分已入账余额与已提现金额，并支持对账、风控与分批提现。

#### 3.5 提现记录表

用于记录创作者发起的提现请求及平台处理结果，与 `payments` 配合：提现记录表描述「谁、何时、提多少、状态」，`payments` 描述「实际打款方式与结果」。

**表名示例**：`withdrawals`。

**核心字段建议**：

- `id`：主键。
- `userId`：申请人（创作者），`users.id`。
- `amountCents`：提现金额（分）。
- `currency`：币种。
- `status`：`pending | processing | completed | rejected | cancelled`。
- `paymentId`：可选，关联 `payments.id`（打款成功时写入，便于对账）。
- `rejectReason`：`status = rejected` 时的原因。
- `requestedAt`：申请时间。
- `processedAt`：处理完成时间（通过/拒绝/打款完成）。
- `createdAt`, `updatedAt`。

**流程简述**：

1. 创作者在「账户余额」页发起提现，系统校验 `user_accounts.balanceCents >= amountCents`，扣减余额并插入一条 `withdrawals`（`status = pending`）。
2. 运营/系统处理：打款后更新 `status = completed`，并写入 `payments`（`type = "creator_payout"`，`relatedId = withdrawals.id`），可选回写 `paymentId`。
3. 若拒绝，`status = rejected`，并将 `amountCents` 加回 `user_accounts.balanceCents`。

---

### 4. 创作者体系与 100 元开通流程（复用 `users`）

#### 4.1 创作者身份建模

现有 `users` 字段包含：

- `id, name, email, role ("admin" | "user" | "member"), company, position, website, github, twitter, ...`

在不新建表的前提下，可以：

- 通过 **`role` 或新增布尔字段** 标记创作者身份，例如：
  - 约定 `role = "member"` 表示「普通注册用户」，`role = "user"` 表示「普通用户」，`role = "admin"` 表示管理员；
  - 或增加一个布尔字段 `isCreator boolean`（仅新增字段，不新增表）。
- 新增一个 JSON 字段，例如：
  - `payoutSettings jsonb`：存放创作者收款设置，如：

    ```json
    {
      "bank": {
        "accountName": "张三",
        "accountNumber": "****",
        "bankName": "xx 银行",
        "branch": "xx 支行"
      },
      "alipay": "xxx@example.com",
      "wechat": "wechat-id"
    }
    ```

这样可以满足「创作者绑定银行账号收款」的需求，而无需引入单独的 bank_accounts 表。

#### 4.2 成为创作者的 100 元流程

业务流程设计（全部复用 `users` + `payments` + 新订单表）：

1. 用户在前端点击「成为创作者」。
2. 系统创建一笔 **创作者资格订单**（`orders`）：
   - `productType = "creator_membership"`；
   - `amountCents = 10000`（100 元）；
   - `platformFeeCents = 10000`，`creatorEarningsCents = 0`（此笔收入全部归平台）。
3. 引导用户完成支付：
   - 创建 `payments` 记录，`type = "creator_onboarding"`，`relatedId = 订单 id` 或 `users.id`。
   - 调用支付渠道后更新 `payments.status`。
4. 当支付成功时：
   - 将订单 `status` 更新为 `completed`；
   - 将用户更新为创作者身份（例如 `isCreator = true` 或 `role` 切换为约定的创作者角色）。
   - 引导用户填写或补充 `payoutSettings`（银行账户信息等）。

整个过程中：**不需要新建创作者表，完全复用 `users` + `payments` + 订单表**。

#### 4.3 创作者分成结算（结合用户账户与提现）

- 每一笔 Persona/Skill 订单在 `orders` 中记录：`amountCents`, `platformFeeCents`, `creatorEarningsCents`, `creatorId`。
- **订单完成**：将 `creatorEarningsCents` 入账到该创作者的 **用户账户表**（`user_accounts.balanceCents` 增加），实现站内过户余额。
- **提现**：创作者发起提现后，在 **提现记录表**（`withdrawals`）中记录申请；扣减 `user_accounts.balanceCents`；打款成功后写入 `payments`（`type = "creator_payout"`，`relatedId = withdrawals.id`）。
- 平台可按期统计：某创作者的「当期收入」= 订单表中已完成的 `creatorEarningsCents` 汇总；「可提现余额」= `user_accounts.balanceCents`；「已提现」= 提现记录表中 `status = completed` 的 `amountCents` 汇总。

---

### 5. 现有其他表的复用点

在不新建新表的情况下，部分现有表也可以为 Marketplace 提供配套能力：

- `tags` / `appTags`：
  - 用于标记 Persona / Skill 的分类、场景、难度等属性（如 `persona:leadership`, `skill:ai-processing`）。
- `categories` / `appCategories`：
  - 用于构建 Marketplace 的导航结构（例如「AI 员工」「技能组件」「社交聚合」「知识管理」等栏目）。
- `suggestions`：
  - 用于收集用户对 Persona / Skill 的改进建议（feature/bug/improvement）。
- `ads`：
  - 用于在 Marketplace 中展示付费推广位（如置顶 Persona、推荐 Skill）。
- `recommendations` / `recommendation_apps`：
  - 用于首页或分类页的「推荐配置包」「热门技能」等模块。

这些表都可以直接复用，无需为 Marketplace 另建一套类似结构。

---

### 6. 小结：整体结构（扩展 type + 新增订单 / 账户 / 提现表）

1. **商品层（MCP / AI 应用 / Skill / Persona）**：
   - 全部落在 **`apps`** 表，通过 **`apps.type`** 区分：
     - `client` | `server`：MCP 工具；
     - `application`：AI 应用；
     - `skill`：技能包（市场可售）；
     - `persona`：角色配置包（市场可售）。
   - 分类与标签继续用 `categories` / `tags` / `appCategories` / `appTags`；Persona/Skill 的配置与依赖放在 `apps.features`、`apps.tools`。
   - **关联表**：**`persona_skills`**（Persona 使用的 Skills）、**`persona_mcp_tools`**（Persona 使用的 MCP 工具）、**`skill_mcp_tools`**（Skill 依赖的 MCP 工具），用于页面交叉展示与「被谁使用」类查询。
2. **订单与支付**：
   - **订单表 `orders`**：保存用户购买记录（appId、productType、金额、分成、状态）；商品类型与 `apps.type` 一致（persona / skill）。
   - **`payments` 表**：仅负责支付流水与结果（渠道、状态、交易号等），通过 `type`（如 `marketplace_order`、`creator_onboarding`、`creator_payout`）+ `relatedId` 关联订单或提现记录。
3. **用户账户与提现**：
   - **用户账户表 `user_accounts`**：保存创作者当期站内过户余额（`userId`、`balanceCents`、`currency`）；订单完成后增加余额，提现时扣减。
   - **提现记录表 `withdrawals`**：记录创作者提现申请与处理结果（金额、状态、处理时间）；打款结果写入 `payments`，`relatedId` 指向提现记录 id。
4. **创作者身份与收款**：
   - 复用 **`users`**：`role` / `isCreator`、`payoutSettings jsonb`（银行账号等）；成为创作者需支付 100 元，通过订单 + `payments(type=creator_onboarding)` 完成。
5. **辅助能力**：
   - 复用 `tags`、`categories`、`suggestions`、`ads`、`recommendations` 等表。

**新增表汇总**（在复用 `apps`、`payments`、`users` 前提下）：

- `orders`：订单（用户购买记录）。
- `user_accounts`（或 `user_balances`）：用户（创作者）站内余额。
- `withdrawals`：提现记录。
- **关联表（交叉展示与双向查询）**：
  - `persona_skills`：Persona ↔ Skill 多对多。
  - `persona_mcp_tools`：Persona ↔ MCP 工具多对多。
  - `skill_mcp_tools`：Skill ↔ MCP 工具多对多。

**`apps.type` 扩展**：在现有 `client | server | application` 基础上增加 `skill`、`persona`；`application` 专指 AI 应用，Skill/Persona 通过 `type = skill | persona` 区分。

---

### 7. 数据库表结构实现摘要（已落地）

以下为基于 Drizzle ORM 的已实现表结构，迁移文件：`packages/db/drizzle/0011_*.sql`、`0012_*.sql`。

#### 7.1 扩展的现有表

| 表名 | 变更 |
|------|------|
| **users** | 新增 `is_creator boolean DEFAULT false`、`payout_settings jsonb` |
| **apps** | `type` 枚举扩展：`client \| server \| application \| skill \| persona` |
| **payments** | `type` 枚举扩展：`marketplace_order`、`creator_onboarding`、`creator_payout`；`type` 列长改为 varchar(30) |

#### 7.2 新增表结构

**orders（订单表）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| user_id | text NOT NULL FK→users.id | 购买人 |
| app_id | text FK→apps.id | 商品应用（创作者资格订单可为空） |
| app_meta | jsonb | 商品快照（name/slug/icon/productType/ownerName 等） |
| product_type | varchar(30) | persona / skill / creator_membership |
| amount_cents | integer NOT NULL | 订单总金额（分） |
| currency | varchar(10) DEFAULT 'CNY' | 币种 |
| platform_fee_cents | integer NOT NULL DEFAULT 0 | 平台抽成（分） |
| creator_earnings_cents | integer NOT NULL DEFAULT 0 | 创作者分成（分） |
| creator_id | text FK→users.id | 收款创作者 |
| status | varchar(20) | pending / completed / refunded / cancelled |
| paid_at | timestamp | 支付完成时间 |
| created_at, updated_at | timestamp | |

**user_balances（用户账户/站内余额）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| user_id | text NOT NULL UNIQUE FK→users.id | 用户 |
| balance_cents | integer NOT NULL DEFAULT 0 | 当前余额（分） |
| currency | varchar(10) DEFAULT 'CNY' | 币种 |
| updated_at | timestamp | 更新时间（乐观锁/对账） |

**withdrawals（提现记录表）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| user_id | text NOT NULL FK→users.id | 申请人（创作者） |
| amount_cents | integer NOT NULL | 提现金额（分） |
| currency | varchar(10) DEFAULT 'CNY' | 币种 |
| status | varchar(20) | pending / processing / completed / rejected / cancelled |
| payment_id | text FK→payments.id | 打款成功时关联的支付记录 |
| reject_reason | text | 拒绝原因 |
| requested_at | timestamp NOT NULL | 申请时间 |
| processed_at | timestamp | 处理完成时间 |
| created_at, updated_at | timestamp | |

**persona_skills（Persona–Skill 多对多）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| persona_id | text NOT NULL FK→apps.id CASCADE | Persona 应用 id |
| skill_id | text NOT NULL FK→apps.id CASCADE | Skill 应用 id |
| sort_order | integer DEFAULT 0 | 展示顺序 |
| created_at | timestamp | |
| UNIQUE(persona_id, skill_id) | | |

**persona_mcp_tools（Persona–MCP 多对多）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| persona_id | text NOT NULL FK→apps.id CASCADE | Persona 应用 id |
| mcp_app_id | text NOT NULL FK→apps.id CASCADE | MCP 应用 id |
| sort_order | integer DEFAULT 0 | 展示顺序 |
| created_at | timestamp | |
| UNIQUE(persona_id, mcp_app_id) | | |

**skill_mcp_tools（Skill–MCP 多对多）**

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | 主键 |
| skill_id | text NOT NULL FK→apps.id CASCADE | Skill 应用 id |
| mcp_app_id | text NOT NULL FK→apps.id CASCADE | MCP 应用 id |
| sort_order | integer DEFAULT 0 | 展示顺序 |
| created_at | timestamp | |
| UNIQUE(skill_id, mcp_app_id) | | |

#### 7.3 索引与约束

- **orders**：`user_id`、`app_id`、`creator_id`、`status`、`product_type` 索引。
- **user_balances**：`user_id` 唯一索引。
- **withdrawals**：`user_id`、`status` 索引。
- **persona_skills / persona_mcp_tools / skill_mcp_tools**：左列 + 右列索引、唯一约束 (A, B)；外键 ON DELETE CASCADE。

