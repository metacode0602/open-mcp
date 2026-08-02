# Skills Webhook 接口设计（独立于 daily repo webhook）

## 1. 定位与边界

- **`/api/webhook/daily`**（`route.ts`）：仅负责**仓库级数据**的接收与落库（repos、snapshots、以及与该仓库关联的 **apps 类型应用** 的统计与描述更新）。与本文档、与 skills 逻辑**无任何关联**。
- **`/api/webhook/daily/skills`**（本目录下接口）：**独立接口**，专门接收**已在外部处理好的 skill 数据**，并写入 `repos`（若需）与 `apps`（`type = 'skill'`）。不依赖、不调用、不修改 `daily/route.ts` 的任何逻辑。

两套接口职责分离：仓库/应用归 daily；技能归 skills。

---

## 2. 接口概览

- **URL**：`/api/webhook/daily/skills`
- **方法**：`POST`
- **Content-Type**：`application/json`
- **请求头**（与平台 webhook 约定一致）：
  - `x-webhook-signature`：string（可选，用于签名校验）
  - `x-webhook-timestamp`：string
  - `Content-Type: application/json`

---

## 3. 请求体结构

采用「单 skill 一条事件」的模型，便于幂等写入与排查。

```ts
interface SkillWebhookRequest {
  event_type: 'skill_updated';
  timestamp: string;
  data: SkillWebhookData;
}

interface SkillWebhookData {
  // 仓库身份（用于关联 repos）
  repo_full_name: string;   // 如 "coreyhaines31/marketingskills"
  repo_name: string;        // 如 "marketingskills"
  repo_owner: string;       // 如 "coreyhaines31"

  // skill 定位
  skill_dir: string;        // SKILL 目录名，如 "seo-audit"
  name: string;             // 展示名，优先 frontmatter.name，否则目录名

  // 文本（由外部程序按 MARKETINGSKILLS_IMPORT_DESIGN 处理完毕）
  description: string;
  description_zh: string;
  readme: string;           // SKILL.md 去 frontmatter 后的英文正文
  readme_zh: string;        // 对应中文 markdown

  // 元数据
  version?: string | null;
  category_id?: string | null;
  features?: string[] | null;
  scenario?: string | null; // 建议 ≤50 字符（与 apps.scenario 长度一致）

  license?: string | null;
  tools?: string[] | null;  // 预留
}
```

- **slug** 不在请求体中传递，由本接口按规则计算：  
  `slug = repo_owner + "/" + repo_name + "/" + name`（name 使用与业务一致的标识，如 skill_dir 或 frontmatter name 的 slug 形式，以设计文档为准）。

---

## 4. 数据落库规则

### 4.1 repos

- 按 `repos.fullName === data.repo_full_name` 查询；
- 若存在：取得 `repos.id`，供 skill app 的 `repoId` 使用；
- 若不存在：在本接口事务内**创建一条最小化 repos 记录**（如 id、name、fullName、owner 等必填字段），不依赖 daily 接口事先创建。

### 4.2 apps（skill 记录）

- **唯一键**：`slug`（见上） + `type = 'skill'`。
- **幂等**：若已存在则 **UPDATE**，否则 **INSERT**。

字段映射（逻辑层命名，与 schema 对齐）：

| 请求/计算 | apps 字段 | 说明 |
|-----------|-----------|------|
| 计算所得 | slug | `owner/repo/name` |
| data.name | name | |
| data.description | description | |
| data.description_zh | descriptionZh | |
| data.readme | readme | |
| data.readme_zh | readmeZh | |
| data.version | version | 可空 |
| 固定 | type | `"skill"` |
| 固定 | source | `"admin"` |
| 固定 | status | `"approved"` |
| 固定 | publishStatus | `"online"` |
| repos.id | repoId | 所属仓库 |
| data.category_id | categoryId | 可空 |
| data.features | features | 数组，可空 |
| data.scenario | scenario | 可空，超长则截断（如 50 字符） |
| data.license | license | 可空 |
| 当前时间 | updatedAt / createdAt | 更新/创建时写入 |

其余 apps 字段（如 analysed、featured、verified、deleted 等）按平台默认值填写。

---

## 5. 事务与错误处理

- 所有写操作在同一 **db.transaction** 内完成：repos 查找/创建 → apps upsert。
- **401**：请求头签名校验失败。
- **400**：请求体不符合 SkillWebhookRequestSchema（Zod 校验失败）。
- **500**：事务内异常或未知错误。

成功响应示例（200）：

```json
{
  "success": true,
  "message": "Skill webhook processed successfully",
  "data": {
    "repo_id": "repo_123",
    "app_id": "app_456",
    "slug": "coreyhaines31/marketingskills/seo-audit",
    "processed_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 6. 实现要点（skills/route.ts）

1. 定义 **Zod Schema**：SkillWebhookDataSchema、SkillWebhookRequestSchema（event_type 使用 `z.literal('skill_updated')`）。
2. 请求头校验：可复用或拷贝与 daily 相同的校验函数，**仅在本文件中使用**，不引用 daily/route.ts。
3. POST 流程：校验头 → 解析 JSON → Zod 校验 → 事务内：repos 查找/创建 → 计算 slug → apps 按 slug + type='skill' upsert。
4. 不读取、不调用、不依赖 `../route.ts`（daily）的任何导出或逻辑。

---

## 7. 参考

- 业务字段与入库规范详见：`docs/MARKETINGSKILLS_IMPORT_DESIGN.md`。
- 本接口只负责「接收已处理好的 skill 数据并落库」，翻译、分类、特性/场景分析等均在外部完成。
