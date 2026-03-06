## marketingskills 仓库入库设计（skills → apps）

本文档基于现有数据库设计（`apps` / `repos` / 订单与关联表等），规范如何将 `apps/skills/marketingskills` GitHub 仓库中的 **skills** 及仓库信息落库到平台的 `apps` 体系中。

### 1. 目标与约束

- **数据来源**：GitHub 仓库 `https://github.com/coreyhaines31/marketingskills`（下称 *marketingskills 仓库*）。
- **落库位置**：
  - skill 作为 **apps 表中 `type = 'skill'` 的记录**。
  - 仓库本身信息落在 **`repos` + `apps`（type = 'server' 或 'application'）**，通过 `apps.repoId` 关联。
  - 每个 skill app 通过 `apps.repoId` 与对应的 `repos` 记录建立关联。
- **不新增独立 skills 表**，完全复用当前 marketplace 设计（见 `MARKETPLACE_DB_REUSE_DESIGN.md`）。
- **本设计仅定义入库规则与流程，不限定具体实现语言/脚本位置**。

---

### 2. 关键字段与映射规范

#### 2.1 apps 表中 skill 记录的字段约定

从 `apps/skills/marketingskills/skills/<skill-name>/SKILL.md` 解析得到的数据，映射到 `apps` 字段如下：

- **slug**
  - 规则：`<ownerName>/<repo>/<name>`
  - 其中：
    - `ownerName`：GitHub 仓库 owner（本仓库为 `coreyhaines31`）
    - `repo`：GitHub 仓库名（本仓库为 `marketingskills`）
    - `name`：优先使用 frontmatter 的 `name` 字段；若缺失则回退为目录名（如 `seo-audit`）
  - 示例：`coreyhaines31/marketingskills/seo-audit`

- **name**
  - 使用 frontmatter 中的 `name` 字段；
  - 若无 frontmatter，则使用目录名（`skills/seo-audit` → `"seo-audit"`）。

- **description**
  - 使用 frontmatter 中的 `description` 字段（必填约束参考 AGENTS.md / Agent Skills 规范）。

- **descriptionZh**
  - 在入库前，通过 LLM 将 `description` 翻译为简体中文，结果写入 `apps.descriptionZh`；
  - 译文需保持专业术语准确，可允许在中文中适度本地化（例如 “CRO” 可译为“转化率优化（CRO）”）。

- **readme**
  - `SKILL.md` **去除 frontmatter 后的完整 markdown 正文**，原样写入 `apps.readme` 字段；
  - 不做截断；如需摘要可在后续分析任务中生成并写入 `longDescription`。

- **readmeZh**
  - 在入库前，通过 LLM 将 `readme`（英文 markdown 正文）整体翻译为简体中文 markdown，结果写入 `apps.readmeZh`；
  - 需保留原有 markdown 结构（标题层级、列表、代码块等），仅翻译可读文本。

- **longDescription**
  - 可选：当前阶段可留空（`NULL`），或与 `readme` 保持一致；
  - 若后续有「简版说明 / 摘要」需求，再通过分析任务写入。

- **type**
  - 固定为 `"skill"`。

- **version**
  - 优先读取 frontmatter 中 `metadata.version`，例如：
    - `metadata: { version: 1.1.0 }` → `"1.1.0"`
  - 若无 version，则可置空。

- **source**
  - 固定为 `"admin"`（表示由平台/运营方导入，而非用户提交）。

- **status**
  - 导入时直接设为 `"approved"`。

- **publishStatus**
  - 导入后即对外可见，设为 `"online"`。

- **repoId**
  - 指向 `repos` 表中该 GitHub 仓库记录的主键；
  - 所有来自 `marketingskills` 仓库的 skill 共享同一个 `repoId`。

- **features**
  - 通过 LLM 对 SKILL.md 内容进行分析，提取该 skill 的**核心特性**（如能力要点、方法论、适用维度等），以字符串数组形式写入 `apps.features`；
  - 每条特性建议为简短短语（如「技术 SEO 审计」「转化率优化框架」「邮件序列设计」），数量建议 3～10 条，便于列表与筛选展示。

- **scenario**
  - 通过 LLM 对 SKILL.md 内容进行分析，归纳该 skill 的**主要应用场景**（2-3句话概括），写入 `apps.scenario`；
  - 字段类型为 `varchar(300)`，需控制在 300 字符以内；若 LLM 输出超长，需在实现中截断或要求 LLM 输出简短句式。

- 其他字段
  - `categoryId`：通过 LLM 自动分类得到的**唯一分类 id**（见 4.3 小节），不支持多分类。
  - `license`：可选，可从仓库 `LICENSE` 或 README 中解析，当前可留空或写为 `"MIT"`。
  - `tools`：可选，用于后续从 SKILL 文本中提取结构化信息（如 “Tools Referenced”）。

---

#### 2.2 repos 表与 apps（仓库层 app）的关系

为了「在 apps 表中建立 repos 的关联」，需要保证：

1. **marketingskills 仓库本身在 repos 中有一条记录**，包含 GitHub 仓库的基础信息；
2. 至少有一个代表该仓库的 app 记录（type 可为 `"server"` 或 `"application"`），其 `apps.repoId` 指向该 `repos` 记录；
3. 所有 skill 记录也共用同一个 `repoId`，实现从 skill → repo 的反查。

具体规范：

- **repos 表记录（简要）**
  - `fullName`：`coreyhaines31/marketingskills`
  - `htmlUrl`：`https://github.com/coreyhaines31/marketingskills`
  - 其他如 `description` / `stars` / `watchers` / `forks` / `primaryLanguage` 等，通过 GitHub API 获取并落库。

- **仓库层 app 记录**
  - 在 `apps` 中增加一条代表 marketingskills 仓库的 app：
    - `slug`: `coreyhaines31/marketingskills`
    - `name`: `marketingskills`
    - `description`: 使用 GitHub 仓库描述（如 README 开头摘要）
    - `type`: `"server"` 或 `"application"`（根据平台对「仓库型 app」的现有约定选择）
    - `github`: `https://github.com/coreyhaines31/marketingskills`
    - `repoId`: 指向上文的 `repos` 记录
  - 该记录承载「仓库级」的元信息，skill 记录则承载「技能级」信息。

---

### 3. GitHub 仓库信息获取方案

> 需求 1：**“需要将仓库信息一同保存，相关信息通过 github 查询获取。”**

推荐使用 GitHub 官方 API 或现成 SDK（如 `@octokit/rest`）从远程获取以下信息并落库到 `repos`（以及部分同步到 apps）：

- **基础信息**（对应 repos 表常见字段）：
  - 仓库全名：`full_name` → `coreyhaines31/marketingskills`
  - 描述：`description`
  - 仓库 URL：`html_url`
  - 主页 / 网站：`homepage`
  - 默认分支：`default_branch`
  - 可见性：`private` / `public`

- **统计信息**：
  - `stargazers_count` → stars
  - `subscribers_count` / `watchers_count` → watchers
  - `forks_count` → forks
  - `open_issues_count` → issues
  - `language` / `languages_url` → primaryLanguage / languages 列表

- **时间信息**：
  - `created_at` → repoCreatedAt
  - `pushed_at` / `updated_at` → lastCommit / updatedAt 等

整体流程：

1. 调用 GitHub API `GET /repos/{owner}/{repo}` 获取仓库详情；
2. 在 `repos` 中按 `fullName` 做 upsert；
3. 将 `repos.id` 回填到：
   - 仓库层 app 记录的 `apps.repoId`；
   - 所有 skill app 记录的 `apps.repoId`。

---

### 4. 入库流程设计（技能维度）

以一次性/定期执行的「同步脚本」为例，流程如下：

1. **准备：确保 repos / 仓库层 app 存在**
   - 调用 GitHub API 创建/更新 `repos` 记录；
   - 若 apps 中不存在 slug 为 `coreyhaines31/marketingskills` 的 app，则创建一条仓库层 app。

2. **遍历 skills 目录**
   - 遍历 `apps/skills/marketingskills/skills/**/SKILL.md`；
   - 对每个 `SKILL.md`：
     - 使用 frontmatter 解析工具（如 `gray-matter`）解析 YAML；
     - 拿到：
       - `frontmatter.name`
       - `frontmatter.description`
       - `frontmatter.metadata.version`（可选）
       - `content`（SKILL 正文）

3. **LLM 翻译与自动分类**
   - **3.1 翻译 description / readme**
     - 调用 LLM，将 `frontmatter.description` 翻译为简体中文，得到 `descriptionZh`；
     - 调用 LLM，将 `content`（去除 frontmatter 后的 SKILL 正文）作为英文 markdown 输入，返回结构保持不变的中文 markdown，得到 `readmeZh`；
     - 要求 LLM：
       - 不改动 markdown 语法结构（标题层级、列表、代码块、链接等）；
       - 尽量保持术语一致性和专业性。
   - **3.2 分类候选集准备**
     - 从数据库 `categories` 表中读取所有「可用分类」作为候选集，推荐筛选条件：
       - `status = 'online'`
       - `deleted = false`
     - 为每个候选分类准备结构化描述，至少包含：
       - `id`
       - `name`
       - `slug`
       - `description`
   - **3.3 使用 LLM 进行单一分类选择**
     - 将当前 skill 的关键信息（`frontmatter.name`、`frontmatter.description`、必要时可截断的 `content` 片段）与分类候选集一并提供给 LLM；
     - 要求 LLM：
       - 在给定分类列表中 **只能选择一个最匹配的分类**；
       - 输出严格限定为结构化结果（例如 `{ "categoryId": "<some-id>" }`），供导入脚本安全解析；
     - 根据 LLM 返回的 `categoryId`，写入 apps 的 `categoryId` 字段（以及必要时在 `appCategories` 中建立对应记录）。
   - **3.4 使用 LLM 分析核心特性与应用场景**
     - 将 SKILL.md 的完整内容（或 `name` + `description` + 正文前 N 字符/摘要）作为输入，调用 LLM 进行分析；
     - 要求 LLM 输出结构化结果，例如：
       - `features`：字符串数组，列出该 skill 的**核心特性**（能力要点、方法论、适用维度等），每条为简短短语，数量建议 3～10 条；
       - `scenario`：单个字符串，**一句话概括主要应用场景**，且长度不超过 50 字符（对应 `apps.scenario` 的 varchar(50)）；
     - 输出格式建议为 JSON，如 `{ "features": ["...", "..."], "scenario": "..." }`，便于解析并写入 `apps.features` 与 `apps.scenario`。
     - 所有 LLM 调用（含 3.1 / 3.2 / 3.3 / 3.4）均需遵守「5. LLM 调用与平台限流处理」中的限流与重试策略。

4. **构造 apps 数据**
   - 计算 `name`：
     - 优先 `frontmatter.name`，否则使用目录名；
   - 构造 `slug`：
     - `slug = "coreyhaines31/marketingskills/" + name`；
   - 设置字段：
     - `type = "skill"`
     - `description = frontmatter.description`
     - `readme = content`（SKILL.md 去除 frontmatter 后的完整正文）
     - `descriptionZh = 上文 3.1 翻译得到的中文描述`
     - `readmeZh = 上文 3.1 翻译得到的中文 markdown`
     - `version = frontmatter.metadata.version`（如存在）
     - `source = "admin"`
     - `status = "approved"`
     - `publishStatus = "online"`
     - `repoId = <repos 记录 id>`
     - `categoryId = 上文 3.3 由 LLM 选择出的分类 id`
     - `features = 上文 3.4 由 LLM 分析得到的核心特性数组`
     - `scenario = 上文 3.4 由 LLM 分析得到的应用场景（≤50 字符）`
     - 其余如 `license` 可根据需要补充。

5. **幂等写入（upsert）**
   - 以 `slug` 作为唯一业务主键进行 upsert：
     - 若 `apps.slug = 当前 slug` 且 `type = "skill"` 已存在，则执行 **update**（更新 description / readme / version / repoId 等字段）；
     - 否则执行 **insert**。
   - 保证多次执行同步脚本不会产生重复记录。

---

### 5. LLM 调用与平台限流处理

同步过程中会多次调用 LLM（翻译 description/readme、分类选择、特性与场景分析等），必须考虑**平台限流**（如 QPM/QPD、并发数、429 响应等），避免脚本因限流失败或对平台造成压力。

- **限流与重试策略**
  - **识别限流**：当 LLM 接口返回 HTTP 429（Too Many Requests）或响应体中包含限流/配额相关错误码时，视为触达限流；
  - **Retry-After**：若响应头或 body 中提供 `Retry-After`（秒），优先按该时长等待后再重试；
  - **指数退避**：若无 Retry-After，采用指数退避重试（例如 1s、2s、4s…，并设置最大重试次数与上限等待时间）；
  - **重试次数**：单次 LLM 请求建议最多重试 3～5 次，超过后对该 skill 标记失败并继续下一个，或整体中止并记录断点便于续跑。
- **请求节奏控制**
  - **串行化**：同一 skill 的多轮 LLM 调用（翻译、分类、特性分析）建议在同一 skill 内串行执行，避免单 skill 内并发放大 QPM；
  - **跨 skill 节流**：在多个 skill 之间，每次 LLM 调用完成后可增加固定间隔（如 200～500ms）再发起下一调用，降低瞬时 QPS；
  - **可选批量化**：若平台支持批量接口（如一次请求返回多段翻译），可优先使用以减少请求次数，从而缓解限流。
- **可配置项**
  - 建议将「重试次数」「退避基数/上限」「请求间隔」等做成配置项或环境变量，便于按不同 LLM 平台的限流策略调整。
- **失败与续跑**
  - 单 skill 因限流或 LLM 异常失败时，建议记录该 skill 的 slug/路径到失败列表，不阻塞其余 skill 的入库；
  - 支持「断点续跑」：下次执行时跳过已成功入库的 skill（按 slug 判断），仅处理未入库或已标记失败的 skill，以降低重复调用与限流概率。

---

### 6. apps 与 repos 的关联关系小结

- 对于 marketingskills 仓库：
  - `repos` 中有一条记录，唯一键为 `fullName = "coreyhaines31/marketingskills"`。
  - `apps` 中：
    - 至少一条 **仓库层 app**：`slug = "coreyhaines31/marketingskills"`，`repoId` 指向该 `repos.id`；
    - N 条 **skill app**：`slug = "coreyhaines31/marketingskills/<skill-name>"`，`type = "skill"`，`repoId` 同样指向该 `repos.id`。

这样可以满足：

- 从 skill 反查所属 GitHub 仓库信息（stars、forks、语言等）；
- 从仓库视角查看该仓库贡献了哪些技能（通过 `apps.repoId` 过滤并按 `type = "skill"` 筛选）。

---

### 7. 后续扩展方向（非当前必需）

- **技能之间的关系建模**：
  - 目前 SKILL.md 中的 “Related Skills” 仅是文本引用；
  - 若需要在数据库中显式建模，可使用 `relatedApps` 表，以 `type = "related"` 记录 skill 之间的关联。

- **Skill 与 MCP 工具关系**：
  - marketingskills 的工具索引在 `tools/REGISTRY.md`，各 skill 的 “Tools Referenced / Tool Integrations” 部分可解析成结构化数据；
  - 若平台中已有对应 MCP 应用（apps.type = "client" / "server"`），可通过 `skill_mcp_tools` 记录 skill ↔ MCP 工具的多对多关系。

- **多仓库支持**：
  - 当前 slug 规则已经包含 `ownerName/repo` 前缀，可直接复用到其他 GitHub 仓库的技能同步，避免 slug 冲突。

