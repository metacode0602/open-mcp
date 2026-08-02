# 一仓多 Skill 分析与实现方案

## 1. 参考仓库与结构约定

### 1.1 参考仓库

- **GitHub 仓库**：[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)  
  Marketing skills for Claude Code and AI agents（CRO、copywriting、SEO、analytics、growth engineering 等）。
- **本地克隆结构**：本仓库中的 `apps/skills/marketingskills` 即上述 GitHub 仓库的 clone，用于参考目录与文件结构。

### 1.2 Skills 目录约定

- **默认约定**：用户输入的「GitHub skills 仓库」中，**所有 skills 均位于根目录下的 `skills` 目录**。
- **具体结构**：每个 skill 对应一个子目录，子目录内包含 `SKILL.md`，即：
  - 路径形式：`skills/<skill-dir>/SKILL.md`
  - 示例（marketingskills）：
    - `skills/seo-audit/SKILL.md`
    - `skills/site-architecture/SKILL.md`
    - `skills/sales-enablement/SKILL.md`
    - `skills/copywriting/SKILL.md`
    - …（数十个 skill 子目录）
- **SKILL.md 内容**：frontmatter（如 `name`、`description`、`metadata.version`）+ 正文（作为 readme）。

因此，实现目标可归纳为：**用户输入一个 GitHub skills 仓库 URL → 在默认的 `skills` 目录下找到所有 SKILL.md → 翻译 → 本地数据库保存 → 同步到 web 项目并展示。**

---

## 2. 本地数据库表设计（保存 SKILL.md 信息）

在 **github-nextjs** 使用的数据库中新增一张表，用于在「翻译后、同步到 web 前」持久化每条 skill 的解析与翻译结果，便于本地查询、重试同步与变更检测。

### 2.1 表名与职责

- **表名**：`project_skills`（建议）。
- **职责**：按「项目 + skill 目录」维度保存 SKILL.md 的解析结果（中英文字段）、版本与同步状态，作为 web 同步的数据源与审计依据。

### 2.2 字段设计

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | text, PK | 主键（如 nanoid）。 |
| `project_id` | text, NOT NULL, FK(projects.id, onDelete: cascade) | 所属 project（type=skill）。 |
| `skill_dir` | text, NOT NULL | 该 skill 在仓库内的目录名（如 `seo-audit`）；单文件模式可用 repo name。与 `project_id` 组成业务唯一键。 |
| `name` | text, NOT NULL | 展示名，来自 SKILL.md frontmatter 的 `name` 或 fallback 到 `skill_dir`。 |
| `description` | text, NOT NULL | 英文描述（frontmatter）。 |
| `description_zh` | text, NOT NULL, default '' | 中文描述（翻译后）。 |
| `readme` | text, NOT NULL | 英文正文（去 frontmatter 的 Markdown）。 |
| `readme_zh` | text, NOT NULL, default '' | 中文正文（翻译后）。 |
| `version` | text, nullable | 版本，来自 frontmatter（如 metadata.version）。 |
| `content_hash` | text, nullable | 可选：原始 SKILL.md 内容 hash，用于变更检测与是否需重翻。 |
| `synced_to_web_at` | timestamp, nullable | 最近一次成功同步到 web 的时间；NULL 表示未同步或需重试。 |
| `created_at` | timestamp, NOT NULL | 创建时间。 |
| `updated_at` | timestamp, nullable | 更新时间。 |

- **唯一约束**：`(project_id, skill_dir)`，保证同一项目下同一 skill 目录仅一条记录，同步流程做 upsert（有则更新、无则插入）。

### 2.3 与现有表的关系

- **projects**：一个 project（type=skill）对应多条 `project_skills`（一仓多 skill）。
- **repos**：通过 `projects.repoId` 间接关联；同步到 web 时仍以 repo 维度组 webhook 请求（owner/name 来自 repo）。

### 2.4 实现说明（仅设计，不在此文档要求改代码）

- 在 `apps/github-nextjs/src/drizzle/schema/` 下新增 `project-skills.ts`（或等价命名），定义上述表并导出；在 `schema/index.ts` 中 export。
- 生成并执行迁移（如 `drizzle-kit generate` / `migrate`），在 github-nextjs 使用的库中创建 `project_skills` 表。

---

## 3. 当前逻辑分析

### 3.1 项目创建流程（add-project-button + createProjectAction）

- **入口**：`apps/github-nextjs/src/components/projects/add-project-button.tsx`
  - 用户填写 **GitHub URL** 和 **项目类型**（含 `skill`）。
  - 提交后调用 `createProjectAction(gitHubURL, type)`。

- **服务端**：`apps/github-nextjs/src/actions/projects-actions.tsx` → `createProject(gitHubURL, type)`（`drizzle/projects/create.ts`）：
  1. 从 URL 解析 `owner/name`，调用 GitHub API 拉取仓库基本信息。
  2. 插入一条 **repos** 记录（id、owner、name、default_branch、stars、description 等）。
  3. 插入一条 **projects** 记录（id、repoId、name、slug、type、**skillMdPath** 默认 `"SKILL.md"`）。
  4. 创建 **readme sync** 任务并异步执行（与 skill 无关）。

- **结论**：项目创建时**只保存「一个 repo + 一个 project」**，没有拉取或保存任何 SKILL.md 内容；skills 的落库发生在**同步任务**里，通过 webhook 推到 web 的 `apps` 表。

### 3.2 当前 Skill 同步（sync-skill-repos）

- **位置**：`apps/github-nextjs/src/lib/tasks/bestofjs/sync-skill-repos.task.ts`
- **逻辑**：
  - 筛选 `type === 'skill'` 且非 deprecated 的 projects。
  - 对每个 project 取**单个** `skillMdPath`（默认 `"SKILL.md"`），即**一 repo 一文件**。
  - `fetchSkillMd(owner, name, skillMdPath, defaultBranch)` → `parseSkillMd(raw)` → `buildSkillWebhookPayload` → `sendSkillToWeb`。
  - Web 端 `POST /api/webhook/daily/skills` 按 `slug = repo_owner/repo_name/name` 做 apps 的 upsert（type='skill'）。

- **结论**：当前实现是**「一仓一 skill」**；没有「在 `skills` 目录下扫描所有子目录中的 SKILL.md 并全部同步到 web」的逻辑。

### 3.3 Web 端与数据模型

- **Web 端**（`apps/web/src/app/api/webhook/daily/skills/route.ts`）：
  - 请求体已支持 `skill_dir`、`name` 等，**slug = owner/repo/name**，因此**同一 repo 下多条 skill（不同 name/skill_dir）本身就能并存**，无需改接口。

- **数据模型**：**项目和仓库的定义与表结构不必改**（仍为一 repo 一 project）；需要扩展的是 github-nextjs 侧的「如何发现并同步一仓内 `skills/` 下所有 SKILL.md」，使这些 skill 都能被保存并同步到 web 展示。

---

## 4. 是否已实现「找到所有 SKILL.md 并同步到 web」？

**没有。** 当前仅实现：

1. 用户输入 skills 仓库 URL → 只创建 1 个 repo + 1 个 project（type=skill），并触发 readme sync。
2. 同步任务只根据**单个** `skillMdPath` 拉取**一个** SKILL.md，推送**一条** skill 到 web。

因此，**没有**实现「用户输入 GitHub skills 仓库 → 找到该仓下所有 SKILL.md（默认在 `skills` 目录）→ 全部同步到 web 项目」的逻辑。

---

## 5. 实现方案（按默认 skills 目录发现并同步）

**目标**：用户输入一个 GitHub skills 仓库 URL（如 `https://github.com/coreyhaines31/marketingskills`），系统在默认的 **`skills`** 目录下找到**所有** `SKILL.md`，并将每条 skill 同步到 web 项目保存与展示。

### 5.1 模式约定

- **默认模式（一仓多 skill）**：  
  - 当 project 的 `skillMdPath` 为**目录**（默认取 `"skills"`）时，表示「在该目录下按子目录扫描所有 SKILL.md」：
    - 列出 `skills` 下所有**子目录**；
    - 对每个子目录 `dir`，若存在 `skills/{dir}/SKILL.md`，则视为一个 skill；
    - `skill_dir` = 子目录名，`name` 优先用 SKILL.md frontmatter 的 `name`，否则用子目录名。
  - 这样符合 marketingskills 等仓库的约定：**所有 skills 都在 `skills` 目录下**。

- **兼容单 skill（可选）**：  
  - 若 `skillMdPath` 为**具体文件路径**（如 `"SKILL.md"` 或 `"skills/default/SKILL.md"`），则保持现有「只拉取该文件、推送 1 条 skill」的行为，用于非标准结构的仓库。

不改变「一个 repo 对应一个 project」的模型；通过 `skillMdPath` 的语义区分「按目录多 skill」与「单文件单 skill」。

### 5.2 发送前翻译（description_zh、readme_zh）

- **约定**：在调用 webhook 之前，必须将 SKILL.md 的英文内容翻译成中文，与英文字段**一起**同步到 web。
- **需翻译字段**：
  - **description** → **description_zh**：技能描述（frontmatter 中的 description）。
  - **readme** → **readme_zh**：SKILL.md 去除 frontmatter 后的正文（Markdown），翻译时保持 Markdown 结构（标题、列表、代码块等），仅翻译可读文本。
- **实现要点**：
  - 使用翻译 API（如 Azure Translator）在 github-nextjs 同步流程中完成翻译；若 readme 过长则按段分批翻译再拼接。
  - 环境变量：`AZURE_TRANSLATOR_KEY`、`AZURE_TRANSLATOR_REGION`（或 `NEXT_PUBLIC_*` 同名字段）。未配置时同步会因翻译失败而报错。
  - 每条 skill 在 **fetch → parse → 翻译（description + readme）→ buildPayload（含 description_zh、readme_zh）→ sendSkillToWeb** 后，web 端一次性落库中英文两个字段。

### 5.3 数据流（含本地落库）

整体流程：**创建 skill 项目 → 创建 repo + project → 异步 readme 同步 → 异步 skill 同步（拉取该仓下所有 SKILL.md → 翻译 → 本地数据库保存 → 同步到 web）**。

1. **用户输入**：GitHub skills 仓库 URL（如 `https://github.com/coreyhaines31/marketingskills`），项目类型选 skill。可选：指定「Skills 目录」（默认 `skills`），写入 `projects.skillMdPath`。
2. **保存**：仍只保存 1 个 repo + 1 个 project；project 的 `skillMdPath` 决定同步时是「按目录扫描多 skill」还是「单文件单 skill」。
3. **异步 readme 同步**：项目创建后触发现有 readme 同步（与 skill 内容无关，仅仓库级 README 等）。
4. **异步 skill 同步**（项目创建后触发或定时任务 sync-skill-repos）：
   - **拉取**：按 `skillMdPath` 列出子目录（目录模式）或取单文件路径，拉取该仓下所有目标 SKILL.md。
   - **解析**：对每个 SKILL.md 解析 frontmatter（name、description、version）与正文（readme）。
   - **翻译**：将 description、readme 翻译为中文，得到 description_zh、readme_zh。
   - **本地数据库保存**：将每条 skill 的解析与翻译结果 **upsert 到 `project_skills` 表**（以 project_id + skill_dir 为唯一键），并可选写入 content_hash、updated_at；若为首次写入则设置 created_at。
   - **同步到 web**：从本地 `project_skills`（或当前内存结果）组装 webhook 请求体，对每条 skill 调用 `POST /api/webhook/daily/skills`；成功后可更新该记录的 `synced_to_web_at`。
5. **Web**：现有 `POST /api/webhook/daily/skills` 已支持按 slug upsert，同一 repo 下多条 skill 自然落库并展示；中英文字段一并写入。

### 5.4 需要新增/修改的代码（实现清单）

| 序号 | 项目 | 说明 |
|------|------|------|
| 1 | **新增表 project_skills** | 在 `apps/github-nextjs/src/drizzle/schema/` 下新增表定义（见 2.2），唯一约束 `(project_id, skill_dir)`；生成并执行迁移。 |
| 2 | **GitHub 列出目录** | 在 `apps/github-nextjs/src/lib/skill-sync/` 下新增函数：用 GitHub Contents API 列出指定目录下子目录名列表（如 `skills` → `["seo-audit", ...]`）。 |
| 3 | **发送前翻译** | 在 `apps/github-nextjs/src/lib/skill-sync/` 下翻译模块：将 `description` 与 `readme` 翻译为中文，返回 `description_zh`、`readme_zh`；readme 过长时可分段翻译或截断。 |
| 4 | **解析 skillMdPath 模式** | 在 sync 任务或公共方法中：若 `skillMdPath` 表示目录（如 `"skills"`），则走「多 skill」分支：先 list 子目录，再对每个子目录请求 `{skillMdPath}/{dir}/SKILL.md`。 |
| 5 | **拉取 → 翻译 → 本地保存** | 对每条 skill：fetch → parse → 翻译 → **upsert 到 `project_skills`**（含 name、description、description_zh、readme、readme_zh、version、可选 content_hash、updated_at）；成功发送 webhook 后更新 `synced_to_web_at`。 |
| 6 | **多 skill 同步循环** | 目录模式：list 子目录 → 对每个 dir 执行「fetch → parse → 翻译 → 写入 project_skills → buildPayload → sendSkillToWeb」；单文件模式同样在发送前完成翻译与本地保存。 |
| 7 | **默认值** | 对 type=skill 的 project，默认 `skillMdPath = "skills"`（或在创建/同步时对 type=skill 使用 `"skills"` 作为扫描目录）。 |
| 8 | **（可选）添加项目表单** | 当类型为 skill 时，可增加可选字段「Skills 目录」默认 `skills`，写入 `projects.skillMdPath`。 |

### 5.5 实现要点小结

- **listSkillDirs(owner, repo, basePath, ref)**  
  调用 GitHub Contents API 列出 `basePath`（如 `skills`）下子目录名列表。

- **sync-skill-repos.task 分支逻辑**  
  - 若当前 project 的 skillMdPath 判定为「目录模式」（如值为 `skills` 或 `skills/`），则调用 listSkillDirs，再对每个 dir：拉取 `{skillMdPath}/{dir}/SKILL.md` → 解析 → **翻译** → **写入 project_skills** → 发送 webhook。  
  - 否则保持单文件逻辑：拉取 → 解析 → **翻译** → **写入 project_skills** → 发送。

- **与参考仓库一致**  
  实现后，用户输入 `https://github.com/coreyhaines31/marketingskills` 这类仓库时，系统会在 `skills` 目录下找到所有子目录中的 SKILL.md，并全部同步到 web 项目展示。

---

## 6. 参考

- 参考仓库结构：`apps/skills/marketingskills`（对应 [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)）。
- 单 skill 同步与 webhook 设计：`docs/SKILL_REPO_SYNC_DESIGN.md`、`apps/web/src/app/api/webhook/daily/skills/DESIGN.md`。
