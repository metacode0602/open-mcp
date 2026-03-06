# users 与 creators 表设计说明

从**使用方便性**和**系统设计**角度，对 `users`（auth-schema）与 `creators`（mcp-schema）的职责划分与字段约定。**数据库设计已按本文约定更新。**

---

## 一、职责与现状

| 表 | 职责 | 现状 |
|----|------|------|
| **users** | 账号、认证、权限、封禁、**是否创作者标识** | 保留 **isCreator**，供前端判断当前用户是否创作者以展示不同页面；不包含 payoutSettings、profile 等 |
| **creators** | 创作者在市场上的公开资料、状态与收款配置 | 与 users 1:1（userId unique）；含 payoutSettings、creatorsRelations；description/bio、avatar/avatarUrl 语义已明确 |
| **orders** | 订单与分成 | `creatorId` → **users.id**（分成给「用户」）；若需按创作者维度查订单/展示，可后续改为引用 creators.id |

---

## 二、users 表约定

### 2.1 保留字段

| 字段 | 说明 |
|------|------|
| **isCreator** | **保留**。前端需根据「当前用户是否为创作者」展示不同页面（如创作者工作台、普通用户首页），在 users 上存该标识便于鉴权与列表查询，无需每次查 creators 表。 |

### 2.2 不放在 users 的字段

| 字段 | 说明 |
|------|------|
| **payoutSettings** | 收款属于创作者维度，已放在 **creators** 表；users 仅负责账号与身份标识。 |
| **profile 类** | location / bio / company / position / website / github / twitter 等统一在 **creators** 维护，不在 users 重复。 |

---

## 三、creators 表约定

### 3.1 已明确语义的字段（均保留）

| 字段 | 语义 | 说明 |
|------|------|------|
| **description** | 一句话介绍 | 短句/ tagline，用于列表、卡片等简短展示。 |
| **bio** | 详细介绍 | 长文简介，用于创作者主页等完整展示。 |
| **avatar** | 真实使用的地址 | 前端展示时使用的头像 URL（如 OSS 或 CDN 地址）。 |
| **avatarUrl** | 源地址 | 第三方或用户上传的原始头像地址，仅作来源记录。 |

二者均保留，便于不同场景使用与溯源。

### 3.2 已添加的字段与 relations

- **payoutSettings**（jsonb）：创作者收款信息（银行/支付宝/微信等），用于提现与分成。
- **creatorsRelations**：`creators.user` → `users`，便于联表与类型推导。

### 3.3 orders.creatorId 的引用方式（可选演进）

当前 **orders.creatorId** 引用 **users.id**，满足「分成给哪个用户」的结算需求。

- 若后续需要**按创作者维度查订单、或在订单列表中直接展示创作者信息**，可将 **orders.creatorId** 改为引用 **creators.id**（再通过 creators.userId 关联 users），订单即可直接 join 创作者表展示头像、名称等。
- 若暂不需要上述能力，保持 creatorId → users.id 即可，creators 仅用于展示与收款配置。

---

## 四、小结

| 表 | 约定 |
|----|------|
| **users** | 保留 isCreator（供页面按是否创作者展示不同内容）；不包含 payoutSettings、profile 类字段。 |
| **creators** | description=一句话介绍、bio=详细介绍；avatar=真实使用地址、avatarUrl=源地址，均保留；已含 payoutSettings 与 creatorsRelations。 |

这样：

- **使用方便性**：前端用 users.isCreator 判断展示哪类页面；创作者展示与收款统一在 creators；语义清晰，避免混用。
- **系统设计**：users 负责账号与身份标识，creators 负责市场侧资料与收款；两者职责清晰，orders 可按需选择引用 users.id 或将来演进为 creators.id。
