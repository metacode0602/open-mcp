
export interface AuthorInfo {
  name: string
  avatar?: string
  github?: string
  bio?: string
}

export interface GithubStats {
  stars: number
  forks: number
  issues: number
  lastUpdated: string
  repoUrl?: string
}


export type SkillCategory = "data-collection" | "ai-processing" | "platform-integration" | "content-output" | "general-tools"

export interface SkillI18nContent {
  name_en?: string
  description_en?: string
  longDescription_en?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  longDescription: string
  category: SkillCategory
  version: string
  tags: string[]
  author: string
  authorInfo: AuthorInfo
  githubStats?: GithubStats
  installCommand?: string
  configExample?: string
  usecaseIds?: string[]
  i18n?: SkillI18nContent
  verified: boolean
  price?: number
}

export const skillCategories: Record<SkillCategory, { label: string; icon: string; description: string }> = {
  "data-collection": {
    label: "数据采集",
    icon: "Database",
    description: "从各种来源获取和解析数据",
  },
  "ai-processing": {
    label: "AI 处理",
    icon: "Brain",
    description: "使用 AI 模型进行内容分析和生成",
  },
  "platform-integration": {
    label: "平台集成",
    icon: "Plug",
    description: "与第三方平台和服务对接",
  },
  "content-output": {
    label: "内容输出",
    icon: "FileOutput",
    description: "格式化并发布到各渠道",
  },
  "general-tools": {
    label: "通用工具",
    icon: "Wrench",
    description: "调度、缓存等基础设施能力",
  },
}

export const skills: Skill[] = [
  {
    id: "rss-fetcher",
    name: "RSS Fetcher",
    description: "高性能 RSS/Atom 订阅源抓取与解析，支持并发和增量更新。",
    longDescription: "RSS Fetcher 是一个专为 OpenClaw 设计的数据采集 Skill，支持 RSS 2.0、Atom 1.0 等主流订阅格式。内置并发控制、增量去重、超时重试机制，可高效抓取数百个订阅源。输出标准化的文章对象，方便后续 AI 处理。",
    category: "data-collection",
    version: "1.2.0",
    tags: ["RSS", "Atom", "爬虫", "订阅"],
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 860, forks: 120, issues: 5, lastUpdated: "2026-02-20", repoUrl: "https://github.com/openclaw/skill-rss-fetcher" },
    installCommand: "openclaw skill add rss-fetcher",
    configExample: `skill: rss-fetcher
config:
  urls:
    - https://sspai.com/feed
    - https://36kr.com/feed
  concurrency: 5
  timeout: 10s
  dedup: true`,
    usecaseIds: ["rss-social-digest"],
    i18n: {
      name_en: "RSS Fetcher",
      description_en: "High-performance RSS/Atom feed fetching and parsing with concurrency and incremental updates.",
      longDescription_en: "RSS Fetcher is a data collection Skill designed for OpenClaw, supporting RSS 2.0, Atom 1.0 and other mainstream formats. Built-in concurrency control, incremental deduplication, and timeout retry mechanisms for efficiently fetching hundreds of feeds.",
    },
    verified: true,
    price: 0,
  },
  {
    id: "web-scraper",
    name: "Web Scraper",
    description: "通用网页内容抓取，支持动态渲染页面和结构化数据提取。",
    longDescription: "Web Scraper 提供对任意网页的内容抓取能力，支持静态和动态渲染页面（通过 Headless Chrome）。内置 CSS 选择器和 XPath 解析器，可提取结构化数据。支持自定义 User-Agent、代理配置和反爬策略。",
    category: "data-collection",
    version: "2.0.1",
    tags: ["爬虫", "网页", "Headless", "数据提取"],
    author: "王小明",
    authorInfo: {
      name: "王小明",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=wangxm",
      github: "https://github.com/wxm-dev",
      bio: "全栈工程师，技术博主，专注内容自动化。",
    },
    githubStats: { stars: 2340, forks: 456, issues: 18, lastUpdated: "2026-02-22", repoUrl: "https://github.com/wxm-dev/skill-web-scraper" },
    installCommand: "openclaw skill add web-scraper",
    configExample: `skill: web-scraper
config:
  url: "https://example.com"
  renderer: headless  # static | headless
  selectors:
    title: "h1.title"
    content: "article.main"
  proxy: \${PROXY_URL}`,
    usecaseIds: ["paper-reading-assistant", "social-reply-bot", "bookmark-knowledge-base", "content-calendar-ai", "competitor-monitor"],
    i18n: {
      name_en: "Web Scraper",
      description_en: "Universal web content scraping with dynamic rendering and structured data extraction.",
      longDescription_en: "Web Scraper provides content scraping for any web page, supporting both static and dynamic rendering (via Headless Chrome). Built-in CSS selector and XPath parsers for structured data extraction.",
    },
    verified: true,
    price: 0,
  },
  {
    id: "ai-summarizer",
    name: "AI Summarizer",
    description: "基于 LLM 的智能内容摘要生成，支持多语言和自定义模板。",
    longDescription: "AI Summarizer 利用大语言模型自动为长文本生成结构化摘要。支持 GPT-4o、Claude 等主流模型，可自定义摘要模板、语言偏好和输出格式。适用于新闻、论文、会议纪要等多种场景。",
    category: "ai-processing",
    version: "3.1.0",
    tags: ["AI", "摘要", "LLM", "NLP"],
    author: "张博士",
    authorInfo: {
      name: "张博士",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhangphd",
      github: "https://github.com/zhang-research",
      bio: "AI 研究员，专注 NLP 与 Agent 方向。",
    },
    githubStats: { stars: 4120, forks: 789, issues: 12, lastUpdated: "2026-02-21", repoUrl: "https://github.com/zhang-research/skill-ai-summarizer" },
    installCommand: "openclaw skill add ai-summarizer",
    configExample: `skill: ai-summarizer
config:
  model: gpt-4o-mini
  language: zh
  template: key_points  # key_points | executive | bullet
  max_length: 200`,
    usecaseIds: ["rss-social-digest", "meeting-notes-ai", "paper-reading-assistant", "social-reply-bot", "code-review-assistant", "bookmark-knowledge-base", "content-calendar-ai"],
    i18n: {
      name_en: "AI Summarizer",
      description_en: "LLM-based intelligent content summarization with multi-language and custom templates.",
      longDescription_en: "AI Summarizer uses large language models to automatically generate structured summaries for long texts. Supports GPT-4o, Claude and other mainstream models with customizable summary templates.",
    },
    verified: true,
    price: 7.9,
  },
  {
    id: "ai-classifier",
    name: "AI Classifier",
    description: "基于 AI 的内容智能分类与标签标注，支持自定义分类体系。",
    longDescription: "AI Classifier 使用 LLM 对文本内容进行智能分类和标签标注。支持自定义分类体系、多级分类、置信度评分。可用于邮件分类、内容审核、知识归档等场景。",
    category: "ai-processing",
    version: "1.5.0",
    tags: ["AI", "分类", "标签", "NLP"],
    author: "李工程师",
    authorInfo: {
      name: "李工程师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=lieng",
      github: "https://github.com/li-engineer",
      bio: "资深后端工程师，企业协作工具爱好者。",
    },
    githubStats: { stars: 1560, forks: 234, issues: 8, lastUpdated: "2026-02-19", repoUrl: "https://github.com/li-engineer/skill-ai-classifier" },
    installCommand: "openclaw skill add ai-classifier",
    configExample: `skill: ai-classifier
config:
  model: gpt-4o-mini
  categories:
    - name: "技术"
      description: "技术相关内容"
    - name: "产品"
      description: "产品设计相关"
  multi_label: true
  min_confidence: 0.7`,
    usecaseIds: ["github-star-curator", "email-auto-sorter", "competitor-monitor"],
    i18n: {
      name_en: "AI Classifier",
      description_en: "AI-based intelligent content classification and tagging with custom taxonomy support.",
      longDescription_en: "AI Classifier uses LLM to intelligently classify and tag text content. Supports custom taxonomies, multi-level classification, and confidence scoring.",
    },
    verified: true,
    price: 9.8,
  },
  {
    id: "feishu-bot",
    name: "Feishu Bot",
    description: "飞书机器人集成，支持消息推送、文档创建和群组管理。",
    longDescription: "Feishu Bot 提供与飞书平台的深度集成能力。支持通过 Webhook 和 API 发送富文本消息、创建飞书文档、管理群组成员。内置消息模板引擎，支持 Markdown 转飞书消息格式。",
    category: "platform-integration",
    version: "2.3.0",
    tags: ["飞书", "机器人", "消息推送", "Webhook"],
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 1890, forks: 345, issues: 6, lastUpdated: "2026-02-20", repoUrl: "https://github.com/openclaw/skill-feishu-bot" },
    installCommand: "openclaw skill add feishu-bot",
    configExample: `skill: feishu-bot
config:
  webhook: \${FEISHU_WEBHOOK}
  message_type: interactive  # text | interactive | post
  template: daily_digest`,
    usecaseIds: ["rss-social-digest", "meeting-notes-ai", "email-auto-sorter", "competitor-monitor"],
    i18n: {
      name_en: "Feishu Bot",
      description_en: "Feishu (Lark) bot integration with message pushing, document creation, and group management.",
      longDescription_en: "Feishu Bot provides deep integration with the Feishu platform. Supports sending rich text messages via Webhook and API, creating Feishu documents, and managing group members.",
    },
    verified: true,
    price: 0,
  },
  {
    id: "github-api",
    name: "GitHub API",
    description: "GitHub API 集成，支持仓库、PR、Issue 等操作。",
    longDescription: "GitHub API Skill 封装了 GitHub REST 和 GraphQL API，提供对仓库、Pull Request、Issue、Star 等资源的便捷操作。内置速率限制管理、分页遍历和认证处理。",
    category: "platform-integration",
    version: "1.8.0",
    tags: ["GitHub", "API", "Git", "CI/CD"],
    author: "赵架构师",
    authorInfo: {
      name: "赵架构师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhaoarch",
      github: "https://github.com/zhao-arch",
      bio: "架构师，代码质量与 DevOps 实践专家。",
    },
    githubStats: { stars: 3450, forks: 567, issues: 14, lastUpdated: "2026-02-22", repoUrl: "https://github.com/zhao-arch/skill-github-api" },
    installCommand: "openclaw skill add github-api",
    configExample: `skill: github-api
config:
  token: \${GITHUB_TOKEN}
  api: rest  # rest | graphql
  rate_limit: auto`,
    usecaseIds: ["github-star-curator", "code-review-assistant"],
    i18n: {
      name_en: "GitHub API",
      description_en: "GitHub API integration for repos, PRs, issues, and more.",
      longDescription_en: "GitHub API Skill wraps GitHub REST and GraphQL APIs, providing convenient operations on repositories, Pull Requests, Issues, Stars and other resources.",
    },
    verified: true,
    price: 0,
  },
  {
    id: "notion-sync",
    name: "Notion Sync",
    description: "Notion 数据库双向同步，支持页面创建和属性更新。",
    longDescription: "Notion Sync 提供与 Notion 工作区的双向数据同步能力。支持创建和更新数据库条目、页面内容、附件上传。内置 Markdown 到 Notion Block 的转换器。",
    category: "platform-integration",
    version: "1.4.0",
    tags: ["Notion", "同步", "知识库", "数据库"],
    author: "吴工程师",
    authorInfo: {
      name: "吴工程师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=wueng",
      github: "https://github.com/wu-engineer",
      bio: "前端工程师，个人知识管理爱好者。",
    },
    githubStats: { stars: 2100, forks: 345, issues: 9, lastUpdated: "2026-02-18", repoUrl: "https://github.com/wu-engineer/skill-notion-sync" },
    installCommand: "openclaw skill add notion-sync",
    configExample: `skill: notion-sync
config:
  token: \${NOTION_TOKEN}
  database_id: \${NOTION_DB_ID}
  sync_mode: upsert  # insert | upsert | sync`,
    usecaseIds: ["paper-reading-assistant", "content-calendar-ai"],
    i18n: {
      name_en: "Notion Sync",
      description_en: "Bi-directional Notion database sync with page creation and property updates.",
      longDescription_en: "Notion Sync provides bi-directional data synchronization with Notion workspaces. Supports creating and updating database entries, page content, and file uploads.",
    },
    verified: true,
    price: 0,
  },
  {
    id: "markdown-parser",
    name: "Markdown Parser",
    description: "Markdown 解析与转换，支持多平台格式适配和图片处理。",
    longDescription: "Markdown Parser 提供高级 Markdown 解析和格式转换能力。支持将 Markdown 转换为微信公众号、掘金、知乎等平台的专属格式。内置图片提取、链接检查和代码高亮处理。",
    category: "content-output",
    version: "2.1.0",
    tags: ["Markdown", "解析", "格式转换", "排版"],
    author: "王小明",
    authorInfo: {
      name: "王小明",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=wangxm",
      github: "https://github.com/wxm-dev",
      bio: "全栈工程师，技术博主，专注内容自动化。",
    },
    githubStats: { stars: 1230, forks: 189, issues: 7, lastUpdated: "2026-02-17", repoUrl: "https://github.com/wxm-dev/skill-markdown-parser" },
    installCommand: "openclaw skill add markdown-parser",
    configExample: `skill: markdown-parser
config:
  input: "./drafts/*.md"
  output_format: wechat  # html | wechat | juejin | zhihu
  image_handling: upload  # inline | upload | cdn
  code_highlight: true`,
    usecaseIds: ["auto-blog-publisher", "github-star-curator"],
    i18n: {
      name_en: "Markdown Parser",
      description_en: "Markdown parsing and conversion with multi-platform format adaptation and image processing.",
      longDescription_en: "Markdown Parser provides advanced Markdown parsing and format conversion. Supports converting Markdown to WeChat, Juejin, Zhihu and other platform-specific formats.",
    },
    verified: true,
    price: 10,
  },
  {
    id: "multi-platform-publisher",
    name: "Multi-Platform Publisher",
    description: "一键多平台发布，支持微信、掘金、知乎等 10+ 平台。",
    longDescription: "Multi-Platform Publisher 实现内容到多个平台的一键发布。支持微信公众号、掘金、知乎、简书、CSDN 等 10+ 平台。内置各平台 API 适配器，自动处理格式差异和图片上传。",
    category: "content-output",
    version: "1.6.0",
    tags: ["发布", "多平台", "自动化", "内容分发"],
    author: "周内容",
    authorInfo: {
      name: "周内容",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhoucontent",
      github: "https://github.com/zhou-content",
      bio: "内容运营负责人，数据驱动的内容策略专家。",
    },
    githubStats: { stars: 980, forks: 167, issues: 11, lastUpdated: "2026-02-19", repoUrl: "https://github.com/zhou-content/skill-multi-publisher" },
    installCommand: "openclaw skill add multi-platform-publisher",
    configExample: `skill: multi-platform-publisher
config:
  platforms:
    - wechat_mp
    - juejin
    - zhihu
  confirm: true
  schedule: immediate  # immediate | scheduled`,
    usecaseIds: ["auto-blog-publisher", "design-asset-generator"],
    i18n: {
      name_en: "Multi-Platform Publisher",
      description_en: "One-click publishing to 10+ platforms including WeChat, Juejin, and Zhihu.",
      longDescription_en: "Multi-Platform Publisher enables one-click content publishing to multiple platforms. Supports WeChat Official Account, Juejin, Zhihu, Jianshu, CSDN and 10+ platforms.",
    },
    verified: true,
    price: 8.99,
  },
  {
    id: "scheduler",
    name: "Scheduler",
    description: "灵活的任务调度引擎，支持 Cron 表达式和事件触发。",
    longDescription: "Scheduler 是 OpenClaw 的核心调度 Skill，支持基于 Cron 表达式的定时任务和基于事件的触发机制。内置任务队列、重试策略、并发控制和执行日志。适用于所有需要定时或事件驱动的自动化场景。",
    category: "general-tools",
    version: "3.0.0",
    tags: ["调度", "Cron", "定时任务", "事件触发"],
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 5670, forks: 1023, issues: 15, lastUpdated: "2026-02-22", repoUrl: "https://github.com/openclaw/skill-scheduler" },
    installCommand: "openclaw skill add scheduler",
    configExample: `skill: scheduler
config:
  type: cron  # cron | event | interval
  cron: "0 8 * * *"
  timezone: Asia/Shanghai
  retry:
    max: 3
    backoff: exponential`,
    usecaseIds: ["social-reply-bot", "code-review-assistant", "competitor-monitor"],
    i18n: {
      name_en: "Scheduler",
      description_en: "Flexible task scheduling engine with Cron expressions and event triggers.",
      longDescription_en: "Scheduler is OpenClaw's core scheduling Skill, supporting Cron-based scheduled tasks and event-based trigger mechanisms. Built-in task queue, retry strategies, concurrency control and execution logs.",
    },
    verified: true,
    price: 0.98,
  },
]

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id)
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((s) => s.category === category)
}

export function getSkillsByIds(ids: string[]): Skill[] {
  return skills.filter((s) => ids.includes(s.id))
}

export function getUsecaseIdsForSkill(skillId: string): string[] {
  const skill = getSkillById(skillId)
  return skill?.usecaseIds || []
}
