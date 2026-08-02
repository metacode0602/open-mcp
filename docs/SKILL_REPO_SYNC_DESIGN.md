# Skill 类型仓库同步设计（SKILL.md → apps）

本文档定义：当仓库对应项目为 **type=skill** 时，如何从该仓库获取 **SKILL.md** 内容并落库到平台 `apps`（`type='skill'`），以及如何将**仓库本身的统计信息**作为该 skill 的展示统计。设计参考 [MARKETINGSKILLS_IMPORT_DESIGN.md](./MARKETINGSKILLS_IMPORT_DESIGN.md)，并约束 **仅在必要时调用 LLM**。

---

## 1. 目标与范围

- **适用对象**：在 github-nextjs 中标记为 **type=skill** 的 project 所关联的仓库（即「skill 类型仓库」）。每个这样的 repo 对应一个 skill 展示单元。
- **数据流**：
  1. 从 GitHub 仓库读取 **SKILL.md**（路径可配置，见 3.1）；
  2. 解析 frontmatter 与正文，得到 name、description、readme、version 等；
  3. **仅在必要时**调用 LLM 做 description_zh / readme_zh 翻译（见 4）；
  4. 将结果写入 **packages/db** 的 `repos`（若尚未存在）与 `apps`（`type='skill'`）；skill 的 **stars/forks/watchers 等统计与仓库一致**（来自 repos 或复制到 app）。
- **不新增表**：完全复用现有 `apps`、`repos` 及 [apps/web 的 skills webhook 设计](../apps/web/src/app/api/webhook/daily/skills/DESIGN.md)。

---

## 2. 统计信息约定

- **「仓库本身的统计信息即为 type=skill 的 apps 的统计数据」**：
  - 在 marketplace 展示 skill 时，其 stars、forks、watchers、contributors、releases 等与**该 skill 所关联的 repo** 一致。
  - 实现方式二选一（推荐 A）：
    - **A**：upsert skill app 时，从 `repos` 表读取当前 repo 的统计字段，写入 `apps` 对应列（stars、forks、watchers 等），便于列表/详情直接查 app 即可。
    - **B**：不冗余到 app，展示时通过 `apps.repoId` 关联 `repos` 再取统计（需保证 repos 已由每日仓库 webhook 更新）。
- **推荐 A**：skill 同步时从 `repos` 取数并写入 app，避免展示层强依赖 join；且与现有 daily webhook 更新 app 统计的行为一致（对 type=skill 的 app 仅更新统计、不覆盖 SKILL 内容，见 6.2）。

---

## 3. SKILL.md 的获取与解析

### 3.1 文件路径规则

- **单 repo 单 skill**（当前主要场景）：一个仓库对应一个 skill，SKILL.md 路径可配置，例如：
  - 仓库根目录：`SKILL.md`；
  - 或固定子路径：`skills/default/SKILL.md`（若需与 marketingskills 多 skill 结构兼容）。
- **配置方式**：在 github-nextjs 的 project 配置、或统一配置表中增加可选字段 `skill_md_path`，默认 `SKILL.md`（根目录）。若未来支持「一仓多 skill」，再扩展为按目录遍历（如 `skills/**/SKILL.md`）。

### 3.2 获取方式

- 使用 GitHub API 获取文件内容：
  - `GET /repos/{owner}/{repo}/contents/{path}`，path 为上述 `skill_md_path`；
  - 或 Raw 地址：`https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{path}`。
- 需要仓库的 `default_branch`（可由每日任务已有的 repo 数据或 GitHub API 获取）。

### 3.3 解析规则

- 使用 **gray-matter**（或等价库）解析 SKILL.md：
  - **frontmatter**：YAML，至少解析：
    - `name`：技能展示名；
    - `description`：技能描述（必填）；
    - `metadata.version`：可选版本号。
  - **content**：去除 frontmatter 后的完整 Markdown 正文，作为 skill 的 `readme`，不做截断。

与 [MARKETINGSKILLS_IMPORT_DESIGN.md](./MARKETINGSKILLS_IMPORT_DESIGN.md) 2.1 节一致。

---

## 4. 翻译策略（仅在必要时调用 LLM）

- **description_zh**  
  - 仅在以下情况调用 LLM 翻译：
    - 当前 app 记录不存在，或
    - 当前 `description` 与本次解析结果不一致（如基于内容 hash 或逐字比较），且当前 `descriptionZh` 为空或需更新。
  - 若已有有效 `descriptionZh` 且 description 未变，则**不调用 LLM**，直接复用库中值。

- **readme_zh**  
  - 同上：仅在「无现有 readmeZh」或「readme 内容已变更」时调用 LLM 翻译整篇 Markdown；
  - 要求保持 Markdown 结构（标题、列表、代码块等），仅翻译可读文本。
  - 若内容较长，可考虑「首段/摘要 + 关键小节」翻译以控制 token，或后续再补全；首版可仅翻译前 N 字符。

- **features / scenario / categoryId**  
  - **首版**：可不调用 LLM；可留空，或从 frontmatter 中简单解析（若有约定字段）。
  - **后续**：若需与 [MARKETINGSKILLS_IMPORT_DESIGN.md](./MARKETINGSKILLS_IMPORT_DESIGN.md) 一致，再引入 LLM 分析（限流与重试策略见该文档第 5 节）。

---

## 5. 落库流程（与现有 skills webhook 对齐）

### 5.1 数据写入方

- **推荐**：在 **github-nextjs** 的每日任务（或独立「skill 同步」任务）中：
  1. 筛选出 `project.type === 'skill'` 的 project，并解析其关联的 repo（owner/name、default_branch、id 等）；
  2. 按 3.1–3.3 获取并解析 SKILL.md；
  3. 按 4 决定是否调用 LLM 翻译，得到 description_zh、readme_zh（可选）；
  4. 调用 **apps/web** 的 `POST /api/webhook/daily/skills`，传入已处理好的 skill 数据（见 5.2）。

- **apps/web** 端职责（与 [skills/DESIGN.md](../apps/web/src/app/api/webhook/daily/skills/DESIGN.md) 一致）：
  - 按 `repo_full_name` 查找或创建 `repos` 记录；
  - 以 `slug = owner/repo/name` + `type='skill'` 做 apps 的 upsert；
  - **扩展**：upsert skill app 时，从当前 `repos` 记录中读取 stars、forks、watchers 等，写入 app 对应字段（实现「仓库统计即 skill 统计」）。

### 5.2 请求体扩展（可选）

- 现有 skills webhook 已定义：`repo_full_name`、`skill_dir`、`name`、`description`、`description_zh`、`readme`、`readme_zh`、`version`、`category_id`、`features`、`scenario` 等。
- **单 repo 单 skill** 时，`skill_dir` 可为 repo 名或固定值；`name` 来自 frontmatter.name 或 repo name。
- **不需要**在 body 里再传 repo 统计：由服务端从 `repos` 表读取并写入 app（前提：该 repo 已通过每日仓库 webhook 更新过，或 skills 接口内创建 repo 时写入最小统计后再从 repos 读回）。

### 5.3 幂等与唯一键

- 以 `apps.slug`（`owner/repo/name`）+ `type='skill'` 作为业务唯一键；已存在则 **UPDATE**，否则 **INSERT**，与现有 DESIGN 一致。

---

## 6. 与每日仓库 Webhook 的配合

### 6.1 执行顺序建议

1. **先**执行每日仓库 webhook（现有 `POST /api/webhook/daily`）：更新 `repos` 及该 repo 下所有关联 app 的**统计信息**（stars、forks、readme 等）。
2. **再**执行 skill 同步：对 type=skill 的仓库，拉取 SKILL.md → 解析 → 按需翻译 → 调用 `POST /api/webhook/daily/skills`，写入/更新 skill 的 **内容与统计**。

这样可保证 repos 表已有最新统计，skills 接口在 upsert skill app 时可直接从 repos 拷贝到 app。

### 6.2 避免覆盖 SKILL 内容

- 每日仓库 webhook 中，更新「与该 repo 关联的 apps」时，若某条 app 的 **type 为 'skill'**，则：
  - **仅更新**：stars、forks、watchers、contributors、releases、commits、lastCommit 等**统计与时间类**字段；
  - **不要覆盖**：readme、readmeZh、description、descriptionZh、name、version、features、scenario 等来自 SKILL.md 的字段。
- 这样 skill 的内容完全由 skills webhook / 本同步流程维护，仓库 webhook 只负责把「仓库级统计」同步到该 skill app。

---

## 7. 实现清单（确认后再编码）

| 序号 | 项目 | 说明 |
|------|------|------|
| 1 | **SKILL.md 路径配置** | github-nextjs 中支持为 project（或 repo）配置 `skill_md_path`，默认 `SKILL.md`。 |
| 2 | **获取 + 解析** | 在 github-nextjs 侧用 GitHub API 拉取 SKILL.md，gray-matter 解析 name、description、metadata.version、content(readme)。 |
| 3 | **翻译门控** | 仅当 description/readme 变更或无现有中文译文时调用 LLM；否则复用 DB 已有 description_zh/readme_zh。 |
| 4 | **调用 skills webhook** | 将解析+翻译结果组装为现有 skills 接口请求体，POST 到 apps/web；不传 repo 统计，由服务端从 repos 表取。 |
| 5 | **apps/web skills 接口** | 实现/补全 `POST /api/webhook/daily/skills`（若尚未实现）；upsert 时从 repos 读 stars/forks 等写入 app。 |
| 6 | **daily webhook 分支** | 在 upsertApps 中，对 `type='skill'` 的 app 只更新统计字段，不覆盖 readme/description/name 等。 |
| 7 | **文档** | 本设计写入 `docs/SKILL_REPO_SYNC_DESIGN.md`（本文档）。 |

---

## 8. 参考

- [MARKETINGSKILLS_IMPORT_DESIGN.md](./MARKETINGSKILLS_IMPORT_DESIGN.md)：技能入库规范、LLM 限流与重试。
- [apps/web 的 skills Webhook 设计](../apps/web/src/app/api/webhook/daily/skills/DESIGN.md)：请求体、幂等规则、与 daily 的职责分离。
