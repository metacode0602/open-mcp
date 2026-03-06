# Apps 表 Tag 冗余字段实现方案

## 一、背景与目标

- **现状**：`apps` 与 `tags` 为多对多关系，通过 `app_tags` 关联表连接。列表/详情查询需联表（`apps` ↔ `app_tags` ↔ `tags`），数据量大时性能较差。
- **目标**：在 `apps` 表增加可保存对应 tag 信息的字段，查询时可直接读该字段而无需联表；在任意更新 app-tag 关联时，同步更新该字段与 `app_tags` 表，保证一致性。

## 二、方案概述

1. 在 `apps` 表新增 **冗余字段**（如 `tags_cache`），用于存储该 app 的 tag 信息快照。
2. 所有对 **app-tag 关联** 的增删改，在更新 `app_tags` 的同时，**同步更新** 对应 app 的 `tags_cache`。
3. 列表/详情查询优先使用 `apps.tags_cache`，避免联表。

---

## 三、Schema 设计

### 3.1 新增字段

在 `packages/db/mcp-schema.ts` 的 `apps` 表中增加：

| 字段名       | 类型   | 说明 |
|-------------|--------|------|
| `tags_cache` | `jsonb` | 该 app 的 tag 信息快照，结构见下。可为 `null`，表示尚未同步或暂无标签。 |

**`tags_cache` 结构建议**（便于前端直接展示、筛选）：

```ts
type TagsCacheItem = {
  id: string;    // tag.id
  name: string;  // tag.name
  slug: string;  // tag.slug
  order: number; // 按照app_tags.createdAt排序
};

// apps.tags_cache 类型
TagsCacheItem[] | null
```

- 使用 **jsonb** 的原因：可存 id/name/slug，列表页一次查 `apps` 即可展示 tag，无需再查 `tags`；且 PostgreSQL 对 jsonb 支持 GIN 等索引，若后续需按 tag 名/slug 筛选可扩展。
- 不采用 `text[]` 仅存 tagId：仍需要在展示时批量查 `tags` 取 name/slug，收益有限。

### 3.2 保留现有结构

- **保留** `app_tags` 表及 apps ↔ tags 的 relations：  
  - 保证“多对多关系”的权威数据源不变；  
  - 管理端、统计（如某 tag 下 app 数）、按 tagId 精确筛选等仍可基于 `app_tags`。
- `tags_cache` 仅作为**查询侧冗余**，以 `app_tags` + `tags` 为准，每次变更关联时由应用层或 DB 层写回 `tags_cache`。

---

## 四、同步策略（何时更新 tags_cache）

凡是对“某 app 的 tag 关联”有写操作的地方，在同一个事务内完成：  
1）对 `app_tags` 的 insert/delete；  
2）根据当前该 app 的 `app_tags` + `tags` 重新计算快照，并 `update apps set tags_cache = ? where id = appId`。

### 4.1 需要同步的代码位置

| 位置 | 操作 | 说明 |
|------|------|------|
| `packages/db/database/admin/apps.ts` | `addTag` | 插入一条 `app_tags` 后，刷新该 app 的 `tags_cache`。 |
| `packages/db/database/admin/apps.ts` | `addNewTag` | 插入 tag 并插入 `app_tags` 后，刷新该 app 的 `tags_cache`。 |
| `packages/db/database/admin/apps.ts` | `removeTag` | 删除一条 `app_tags` 后，刷新该 app 的 `tags_cache`。 |
| `packages/db/database/admin/apps.ts` | `updateTags` | 先删后插 `app_tags` 后，刷新该 app 的 `tags_cache`。 |
| `packages/db/database/admin/app-analysis-history.ts` | 分析完成后写 `app_tags` | 插入/冲突忽略 `app_tags` 后，刷新对应 app 的 `tags_cache`。 |
| `apps/web/src/app/api/webhook/daily/route.ts` | 每日 webhook 中写 `app_tags` | 对每个被插入 `app_tags` 的 app，在当次事务内刷新其 `tags_cache`。 |

### 4.2 推荐：抽公共方法统一刷新

在 `packages/db` 内提供**单一刷新函数**，避免重复逻辑与漏写：

- **函数签名建议**：  
  `refreshAppTagsCache(tx, appId: string): Promise<void>`  
  或在无事务处提供 `refreshAppTagsCache(db, appId)`。
- **逻辑**：  
  1. 用 `appId` 查当前 `app_tags` 关联的 `tagId`；  
  2. 用这些 `tagId` 查 `tags` 表取 `id, name, slug`；  
  3. 组装为 `TagsCacheItem[]`；  
  4. `update apps set tags_cache = $value, updated_at = now() where id = appId`。

所有上述 4.1 的调用点，在修改 `app_tags` 的同一事务中（若有）调用一次 `refreshAppTagsCache(tx, appId)` 即可。

### 4.3 可选：标签表本身变更时

若 `tags` 表的 `name`/`slug` 会被修改，则所有引用该 tag 的 app 的 `tags_cache` 会过期。两种做法：

- **方案 A（推荐先不做）**：在“更新 tag”的 admin 接口里，查出所有关联的 `appId`，逐个调用 `refreshAppTagsCache(appId)`。  
- **方案 B**：定时任务或后台 job 按批刷新 `tags_cache`（例如按 app 或按 tag 扫描）。  

首版可在文档中说明“仅当 app_tags 变更时同步；若直接改 tags 表，需另行刷新或跑批”，后续再按需加。

---

## 五、数据迁移与回填

1. **迁移脚本**（Drizzle 或手写 SQL）：  
   - 给 `apps` 表增加列 `tags_cache jsonb DEFAULT NULL`。  
   - 不做 NOT NULL 约束，便于历史数据逐步回填。
2. **回填**：  
   - 一次性脚本：对每个 app，用当前 `app_tags` + `tags` 生成 `TagsCacheItem[]` 并 `UPDATE apps SET tags_cache = $value WHERE id = $id`。  
   - 可与迁移同一步，也可单独脚本；数据量大时可按 batch 处理。

---

## 六、查询侧改造

- **列表/详情**：在 `packages/db/database/web/marketplace.ts`、`packages/db/database/web/mcp-apps.ts` 等当前联表查 tag 的地方：  
  - 若本次查询只需要“展示用 tag 列表”，改为直接使用 `apps.tags_cache`（select 该字段，返回给前端）。  
  - 不再对“仅展示 tag”的场景做 `leftJoin(appTags).leftJoin(tags)`，可显著减少 JOIN 与数据量。
- **仍保留联表的场景**：  
  - 按 tagId 筛选（如“某 tag 下的 apps”）：继续用 `app_tags`（必要时可保留 join）；  
  - 需要 tag 表最新实时字段（如 totalApps）时，仍可 join tags。  
- **兼容**：若某行 `tags_cache` 为 `null`（未回填或老数据），可 fallback 为一次联表查询或返回空数组，保证行为一致。

---

## 七、实现清单（确认后执行）

1. **Schema**  
   - [ ] 在 `apps` 表增加 `tags_cache jsonb`。  
   - [ ] 在 TypeScript 类型/推断中体现 `TagsCacheItem[] | null`（可在 schema 旁定义类型并导出）。

2. **迁移与回填**  
   - [ ] 编写迁移：添加列。  
   - [ ] 编写回填脚本或迁移内回填：根据 `app_tags` + `tags` 更新所有 `apps.tags_cache`。

3. **同步逻辑**  
   - [ ] 在 `packages/db` 中实现 `refreshAppTagsCache(tx, appId)`（或等价），并在上述 4.1 所有写 `app_tags` 的路径中调用。

4. **查询改造**  
   - [ ] marketplace.ts：列表/详情中“仅展示 tag”处改为使用 `apps.tags_cache`，去掉不必要的 join。  
   - [ ] mcp-apps.ts：同上。

5. **测试与校验**  
   - [ ] 单元/集成：对 `addTag` / `removeTag` / `updateTags` 等验证 `tags_cache` 与 `app_tags` 一致。  
   - [ ] 回填后抽样对比：`app_tags`+`tags` 与 `tags_cache` 一致。

---

## 八、小结

- 在 **apps 表增加 `tags_cache`（jsonb）**，存 `{ id, name, slug }[]`，作为 tag 信息的查询侧冗余。  
- **更新时**：凡写 `app_tags` 的地方，在同一事务内调用统一方法 **同步更新** 对应 app 的 `tags_cache`。  
- **查询时**：列表/详情优先读 `tags_cache`，减少联表，提升性能；按 tag 筛选等仍用 `app_tags`。  
- 通过迁移 + 回填 + 统一刷新函数，保证历史数据与新写入均一致。

确认该方案后，可按第七节清单在代码库中实现并提交。
