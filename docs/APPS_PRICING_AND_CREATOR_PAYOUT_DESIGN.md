# Apps 定价、多货币与创作者分成设计方案

本文档基于现有 `orders`、`payments`、`creators`、`creator_balances`、`withdrawals` 等表，约定：**为 apps 增加定价（支持多货币）、用户购买后才能安装部分 skills、以及创作者分成与多币种账本**的落库与流程设计。

---

## 1. 目标与约束

- **定价**：同一 app（skill/persona）可配置多规格（SKU）、多币种价格；支持「一口价」或后续扩展订阅。
- **多货币**：价格、订单、创作者收入、提现均按币种记录与对账。
- **购买后安装**：需购买（或免费授权）才能安装/启用付费 skill；安装前校验授权。
- **创作者分成**：每笔订单按规则计算平台抽成与创作者收入，入账创作者余额，支持提现；退款时冲销创作者收入。
- **复用现有**：不改变 `orders` / `payments` 核心语义，仅扩展关联与新增表。

---

## 2. 现有表复用要点

| 表 | 复用说明 |
|----|----------|
| **apps** | 已含 `requires_purchase`；并增加冗余字段 `price_cents`、`price_currency`、`price_kind`，供列表展示价格，详见 3.1「apps 表冗余展示价」。 |
| **orders** | 已含 `appId`、`productType`、`amountCents`、`currency`、`platformFeeCents`、`creatorEarningsCents`、`creatorId`、`status`；下单与支付回调继续写此表。 |
| **payments** | `type=marketplace_order`、`relatedId=orders.id`；支付流水与订单关联不变。 |
| **creators** | 创作者主体；`orders.creatorId`、分成入账、提现均与创作者关联。 |
| **creator_balances** | 创作者多币种余额账户（按 creator+currency 记录）；订单完成后增加余额，提现时扣减（见 3.4 / 4.5）。 |
| **withdrawals** | 提现记录；可与 `creator_balances` 配合，按币种扣减并写 ledger。 |

---

## 3. 新增表结构（Drizzle 风格）

### 3.1 定价：app_skus、app_sku_prices

**app_skus**（一个 app 多个售卖规格）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| app_id | text NOT NULL FK→apps.id ON DELETE CASCADE | 所属应用 |
| code | varchar(64) NOT NULL | 业务码，如 default / personal / team |
| name | varchar(255) | 展示名称 |
| description | text | 展示描述（可选） |
| license_type | varchar(20) | one_time / subscription，默认 one_time |
| active | boolean NOT NULL DEFAULT true | 是否上架 |
| sort_order | integer DEFAULT 0 | 展示顺序 |
| created_at | timestamp NOT NULL | |
| updated_at | timestamp NOT NULL | |

- 唯一约束：`(app_id, code)`  
- 索引：`app_id`。

**app_sku_prices**（一个 SKU 多币种价格）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| sku_id | text NOT NULL FK→app_skus.id ON DELETE CASCADE | 所属 SKU |
| currency | varchar(10) NOT NULL | ISO 4217，如 CNY / USD / EUR |
| amount_cents | integer NOT NULL | 价格（该币种最小单位） |
| compare_at_cents | integer | 划线价（可选） |
| active | boolean NOT NULL DEFAULT true | 是否启用 |
| effective_from | timestamp | 生效开始（可选） |
| effective_to | timestamp | 生效结束（可选） |
| created_at | timestamp NOT NULL | |
| updated_at | timestamp NOT NULL | |

- 唯一约束：`(sku_id, currency)`（同一 SKU 同一币种一条有效价格；若需历史调价可改为 (sku_id, currency, effective_from) 等）。  
- 索引：`sku_id`、`currency`。

**免费/付费判定**

- 若存在 `app_sku_prices.active = true` 且 `amount_cents > 0` → 付费商品；需有对应 entitlement 才能安装。
- 若 `amount_cents = 0` 或 SKU 显式标记为免费 → 免费；安装时可直接授予 entitlement 或免校验（由业务决定）。

**apps 表冗余展示价（列表用）**

- 为减轻列表查询压力，在 **apps** 表上增加冗余字段，供列表页直接展示「起售价/默认价」，无需 join `app_skus` / `app_sku_prices`。
- 字段约定：

| 列名 | 类型 | 说明 |
|------|------|------|
| display_price_cents | integer, nullable | 列表展示用价格（该币种最小单位）；通常取默认 sku + 默认币种，或最低价 |
| display_currency | varchar(10), nullable | 展示价格对应币种，如 CNY |
| display_price_kind | varchar(30), nullable | 展示价格类型：one_time / subscription_monthly / subscription_yearly，用于前端展示「¥X」「¥X/月」等 |

- **更新时机**：在创建/更新/删除 `app_sku_prices` 或上下架 `app_skus` 时，按约定规则（如默认 sku、默认币种，或同 app 下最低价）写回上述三字段；无有效可售价格时置为 NULL（列表可展示「免费」或「联系询价」）。
- **数据源**：真实价格与多规格、多币种以 `app_skus` / `app_sku_prices` 为准；详情与下单只读 sku/prices，apps 冗余仅用于列表展示与排序。

---

### 3.2 分成规则：app_revenue_share_rules

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| app_id | text NOT NULL FK→apps.id ON DELETE CASCADE | 所属应用 |
| creator_id | text NOT NULL FK→creators.id | 收款创作者 |
| platform_fee_bps | integer NOT NULL | 平台抽成万分比，如 2000 = 20% |
| currency | varchar(10) | 为空表示该规则适用所有币种；非空则仅该币种 |
| active | boolean NOT NULL DEFAULT true | |
| effective_from | timestamp | 可选 |
| effective_to | timestamp | 可选 |
| created_at | timestamp NOT NULL | |
| updated_at | timestamp NOT NULL | |

- 唯一约束：建议 `(app_id, creator_id, currency)` 或 (app_id, creator_id) 当 currency 为空时唯一。  
- 计算：`creator_share_cents = amount_cents - floor(amount_cents * platform_fee_bps / 10000)`；`platform_fee_cents = amount_cents - creator_share_cents`。  
- 下单时：根据 `appId`（及可选 `currency`）查一条有效规则，得到 `creatorId`、`platformFeeBps`，写入 `orders` 的 `platformFeeCents`、`creatorEarningsCents`、`creatorId`。

---

### 3.3 购买授权：user_app_entitlements

用于「购买后才能安装」的校验；不直接依赖 orders 状态，便于处理退款、赠送、补单与缓存。

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| user_id | text NOT NULL FK→users.id | 用户 |
| app_id | text NOT NULL FK→apps.id ON DELETE CASCADE | 应用（skill/persona） |
| sku_id | text FK→app_skus.id | 购买的规格（可选） |
| source | varchar(20) NOT NULL | order / grant / admin / promo |
| order_id | text FK→orders.id | 来源订单（可选） |
| status | varchar(20) NOT NULL | active / revoked / expired |
| valid_from | timestamp | 生效开始（可选） |
| valid_to | timestamp | 生效结束（订阅用） |
| revoked_at | timestamp | |
| revoke_reason | text | |
| created_at | timestamp NOT NULL | |
| updated_at | timestamp NOT NULL | |

- 唯一约束：不同产品策略二选一：  
  - 方案 A：`(user_id, app_id)` 唯一，同一用户同一 app 仅一条记录；通过 status 区分 active/revoked。  
  - 方案 B：允许多条（如同一用户多次购买同一 app 的 different sku），则不加 (user_id, app_id) 唯一，但校验安装时取「存在一条 status=active 即可」。  
- 索引：`user_id`、`app_id`、`status`、`order_id`。

**安装校验逻辑**

- 用户请求安装/启用某 skill 时：  
  - 若存在 `user_app_entitlements` 且 `status = active`（且在 valid_from/valid_to 内）→ 允许安装。  
  - 若不存在且该 app 有有效价格且价格 > 0 → 拒绝，引导购买。  
  - 若该 app 为免费（无价格或价格为 0）→ 可直接允许或先写入一条 grant 的 entitlement 再允许。

---

### 3.4 创作者多币种余额与账本：creator_balances、creator_balance_ledger

**creator_balances**（按创作者+币种的余额账户）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| creator_id | text NOT NULL FK→creators.id | 创作者 |
| currency | varchar(10) NOT NULL | 币种 |
| balance_cents | integer NOT NULL DEFAULT 0 | 当前余额（分） |
| updated_at | timestamp NOT NULL | |

- 唯一约束：`(creator_id, currency)`。  
- 索引：`creator_id`。

**creator_balance_ledger**（流水，便于对账与审计）

| 列名 | 类型 | 说明 |
|------|------|------|
| id | text PK | createId() |
| creator_id | text NOT NULL FK→creators.id | 创作者 |
| currency | varchar(10) NOT NULL | 币种 |
| delta_cents | integer NOT NULL | 正=入账，负=冲销/提现 |
| type | varchar(30) NOT NULL | order_earning / refund_reversal / payout / adjustment |
| order_id | text FK→orders.id | 关联订单（type=order_earning 时） |
| withdrawal_id | text FK→withdrawals.id | 关联提现（type=payout 时） |
| payment_id | text FK→payments.id | 可选 |
| idempotency_key | varchar(64) | 幂等键，如 order_id 入账用 orders.id |
| metadata | jsonb | 扩展信息 |
| created_at | timestamp NOT NULL | |

- 唯一约束：`(idempotency_key)` 其中 idempotency_key 非空时唯一，防止同一订单重复入账。  
- 索引：`creator_id`、`currency`、`type`、`order_id`、`created_at`。

**与现有 withdrawals 的关系**

- **withdrawals**：保留；提现时按币种从 `creator_balances` 扣减，并写一条 `creator_balance_ledger`（type=payout, delta_cents=-amount）。withdrawals 表可保留 `user_id`（创作者对应用户），如需可增加 `creator_id` 便于统计。

---

## 4. 业务流程

### 4.1 下单

1. 入参：`userId`、`appId`、`skuId`、`currency`。
2. 校验：app 存在且可售；sku 属于该 app 且 active；`app_sku_prices` 存在 (skuId, currency) 且 active，得到 `amountCents`。
3. 查 `app_revenue_share_rules` 得 `creatorId`、`platformFeeBps`，计算 `platformFeeCents`、`creatorEarningsCents`。
4. 写 `orders`：status=pending，写入 appId、productType、amountCents、currency、platformFeeCents、creatorEarningsCents、creatorId、appMeta 等。
5. 返回 orderId；前端据此调起支付（创建 payments 记录，relatedId=orderId）。

### 4.2 支付成功回调

1. 更新 `payments.status = completed`，`orders.status = completed`，`orders.paidAt = now()`。
2. 写入或更新 **user_app_entitlements**：userId、appId、skuId、source=order、orderId、status=active。
3. **创作者入账**：  
   - 写 **creator_balance_ledger**：creatorId、currency、delta_cents=creatorEarningsCents、type=order_earning、order_id、idempotency_key=orderId（防重）。  
   - 更新 **creator_balances**：对应 (creatorId, currency) 的 balance_cents += creatorEarningsCents。

### 4.3 退款

1. 更新 `orders.status = refunded`；若需可写 payments 退款记录。
2. **冲销创作者收入**：  
   - 写 **creator_balance_ledger**：delta_cents=-creatorEarningsCents、type=refund_reversal、order_id、idempotency_key=orderId_refund。  
   - 更新 **creator_balances**：balance_cents -= creatorEarningsCents（允许余额为负，后续订单抵扣；或按风控策略处理）。
3. 更新 **user_app_entitlements**：对应 orderId 的记录 status=revoked，revoked_at、revoke_reason。

### 4.4 安装/启用 Skill 校验

1. 请求：userId、appId（或 slug）。  
2. 若 app 无有效价格或价格为 0 → 视为免费，允许安装（可选：写一条 grant 的 entitlement）。  
3. 若为付费 app：查 `user_app_entitlements` 是否存在 (userId, appId) 且 status=active → 有则允许，无则返回「需购买」及下单链接。

### 4.5 提现（创作者）

1. 从 **creator_balances** 按 (creatorId, currency) 读取 balance_cents，校验可提现金额。  
2. 创建 **withdrawals** 记录（userId=创作者对应用户，或增加 creatorId）；扣减 **creator_balances.balance_cents**。  
3. 写 **creator_balance_ledger**：type=payout、delta_cents=-amount、withdrawal_id、idempotency_key=withdrawalId。  
4. 打款成功后更新 withdrawals.status、payment_id；若打款失败可回滚余额并写 adjustment 流水。

---

## 5. 接口与校验点清单（建议）

| 阶段 | 接口/动作 | 校验点 |
|------|------------|--------|
| 商品展示 | GET /api/apps/:id/prices?currency= | app 存在；返回该 app 的 skus + 指定 currency 的 prices |
| 下单 | POST /api/orders | app/sku/currency 有效；价格与规则存在；库存/限购按需 |
| 支付 | 支付渠道回调 | 验签；orders 未重复完成；写 payments、orders、entitlement、ledger+balance |
| 安装 | POST /api/skills/install 或 GET /api/skills/:id/install | 校验 entitlement 或免费 |
| 退款 | POST /api/orders/:id/refund | 订单状态允许退款；冲销 ledger+balance；撤销 entitlement |
| 提现 | POST /api/withdrawals | 余额充足；写 ledger+扣减 balance+创建 withdrawals |

---

## 6. 已实现扩展

- **apps 表**：已增加 `requires_purchase` boolean，显式标记该 app 是否必须购买后使用（与「无价格=免费」二选一或并存）。  
- **订阅**：`app_skus.license_type=subscription` 时，`user_app_entitlements.valid_to` 表示到期时间；续费或续订时延长时间或新增 entitlement。  
- **税费/支付手续费**：`orders` 已扩展 `tax_cents`、`payment_fee_cents` 字段，分成计算与财务对账时可按需使用。  

---

## 7. 小结

- **新增表**：`app_skus`、`app_sku_prices`、`app_revenue_share_rules`、`user_app_entitlements`、`creator_balances`、`creator_balance_ledger`。  
- **现有表**：`orders`、`payments`、`withdrawals`、`creators` 保持不变或仅做最小扩展（如 withdrawals 增加 creator_id）；创作者多币种余额与流水由新表承担。  
- **流程**：定价 → 下单 → 支付 → 写订单/支付/授权/创作者入账 → 安装校验 entitlement；退款冲销并撤销授权；提现扣减创作者余额并写流水。

实现时可按上述表结构在 `packages/db/mcp-schema.ts` 中新增 Drizzle 表定义，并生成迁移；接口与幂等、并发控制按本方案在业务层实现。
