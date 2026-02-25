import { AuthorInfo, GithubStats } from "./skills"

export type Category = "social" | "creative" | "efficiency" | "knowledge"

export interface I18nContent {
  title_en?: string
  description_en?: string
  scenario_en?: string
  steps_en?: string[]
  effect_en?: string
}

export interface UseCase {
  id: string
  title: string
  description: string
  category: Category
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  scenario: string
  steps: string[]
  configSnippet: string
  effect: string
  author: string
  authorInfo: AuthorInfo
  githubStats?: GithubStats
  skillIds?: string[]
  i18n?: I18nContent
  verified: boolean
  lang: "zh" | "en"
}

export const categories: Record<Category, { label: string; icon: string; description: string }> = {
  social: {
    label: "社交聚合",
    icon: "Users",
    description: "跨平台社交信息汇聚与自动化互动",
  },
  creative: {
    label: "创意构建",
    icon: "Sparkles",
    description: "AI 驱动的内容创作与设计自动化",
  },
  efficiency: {
    label: "效率提升",
    icon: "Zap",
    description: "工作流自动化与日常任务简化",
  },
  knowledge: {
    label: "知识管理",
    icon: "BookOpen",
    description: "信息整理、归档与智能检索",
  },
}

export const usecases: UseCase[] = [
  {
    id: "rss-social-digest",
    title: "RSS 社交动态聚合日报",
    description: "自动聚合 Twitter、微博、RSS 等多平台内容，每日生成精选摘要推送到你的通知渠道。",
    category: "social",
    difficulty: "beginner",
    tags: ["RSS", "Twitter", "微博", "日报"],
    scenario: "你关注了大量科技博主和行业动态来源，分散在 Twitter、微博、RSS 订阅中。每天花大量时间逐个平台刷信息，容易遗漏重要内容。希望有一个自动化方案，每天定时汇总所有平台的关键信息，生成结构化摘要。",
    steps: [
      "配置 RSS 源列表与 Twitter/微博关注列表",
      "设置 OpenClaw 定时抓取任务（每日 8:00）",
      "使用 AI 模型对抓取内容进行摘要提取",
      "通过模板引擎生成格式化日报",
      "推送至飞书/Slack/邮箱等通知渠道",
    ],
    configSnippet: `trigger:
  schedule: "0 8 * * *"
sources:
  - type: rss
    urls:
      - https://sspai.com/feed
      - https://36kr.com/feed
  - type: twitter
    lists: ["tech-leaders"]
processor:
  model: gpt-4o-mini
  prompt: "提取关键信息，生成中文摘要"
output:
  - type: feishu
    webhook: \${FEISHU_WEBHOOK}`,
    effect: "每天节省 40 分钟信息浏览时间，信息覆盖率提升 80%，不再遗漏关键行业动态。",
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 1280, forks: 234, issues: 12, lastUpdated: "2026-02-20", repoUrl: "https://github.com/openclaw/rss-social-digest" },
    skillIds: ["rss-fetcher", "ai-summarizer", "feishu-bot"],
    lang: "zh",
    verified: true,
  },
  {
    id: "auto-blog-publisher",
    title: "博客文章自动排版发布",
    description: "将 Markdown 草稿自动转化为多平台适配的格式，一键发布到微信公众号、掘金、知乎等平台。",
    category: "creative",
    difficulty: "intermediate",
    tags: ["博客", "Markdown", "多平台", "自动发布"],
    scenario: "你是一名技术博主，每次写完文章后需要在多个平台手动排版和发布。不同平台的格式要求不同，图片需要单独上传，链接需要重新适配。这个过程重复且耗时。",
    steps: [
      "在指定文件夹中检测新的 Markdown 文件",
      "解析 Markdown 并提取图片资源",
      "自动将图片上传至图床并替换链接",
      "根据各平台 API 格式化内容",
      "通过平台 API 自动发布并返回链接",
    ],
    configSnippet: `trigger:
  watch: "./drafts/*.md"
pipeline:
  - action: parse_markdown
  - action: upload_images
    provider: cloudflare_r2
  - action: format
    targets:
      - wechat_mp
      - juejin
      - zhihu
  - action: publish
    confirm: true
notify:
  type: telegram
  message: "文章已发布: {title}"`,
    effect: "文章发布时间从 2 小时缩短至 5 分钟，支持一键同步到 5+ 平台。",
    author: "王小明",
    authorInfo: {
      name: "王小明",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=wangxm",
      github: "https://github.com/wxm-dev",
      bio: "全栈工程师，技术博主，专注内容自动化。",
    },
    githubStats: { stars: 876, forks: 143, issues: 8, lastUpdated: "2026-02-18", repoUrl: "https://github.com/wxm-dev/auto-blog-publisher" },
    skillIds: ["markdown-parser", "image-uploader", "multi-platform-publisher"],
    lang: "zh",
    verified: true,
  },
  {
    id: "meeting-notes-ai",
    title: "会议纪要智能整理",
    description: "自动录制会议音频，使用 AI 生成结构化会议纪要，提取待办事项并分发到相关人员。",
    category: "efficiency",
    difficulty: "intermediate",
    tags: ["会议", "语音转文字", "纪要", "待办"],
    scenario: "团队每周有多次在线会议，会后需要人工整理会议纪要，提取行动项，分配到各负责人。这个过程不仅耗时，还容易遗漏关键决策和任务。",
    steps: [
      "会议开始时自动启动录音",
      "会议结束后上传音频至 Whisper 进行转写",
      "使用 GPT 模型结构化整理会议内容",
      "自动提取行动项和负责人",
      "生成纪要推送至飞书文档，待办同步到项目管理工具",
    ],
    configSnippet: `trigger:
  event: meeting_end
  platform: feishu_meeting
pipeline:
  - action: transcribe
    model: whisper-large-v3
  - action: summarize
    model: gpt-4o
    template: meeting_minutes
  - action: extract_todos
    assign: auto
output:
  - type: feishu_doc
    folder: "会议纪要/{date}"
  - type: linear
    project: team-tasks`,
    effect: "会议纪要整理时间从 30 分钟降至 0 分钟，行动项遗漏率降低 95%。",
    author: "李工程师",
    authorInfo: {
      name: "李工程师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=lieng",
      github: "https://github.com/li-engineer",
      bio: "资深后端工程师，企业协作工具爱好者。",
    },
    githubStats: { stars: 2340, forks: 567, issues: 23, lastUpdated: "2026-02-15", repoUrl: "https://github.com/li-engineer/meeting-notes-ai" },
    skillIds: ["whisper-transcriber", "ai-summarizer", "feishu-bot"],
    lang: "zh",
    verified: true,
  },
  {
    id: "paper-reading-assistant",
    title: "论文阅读助手",
    description: "自动追踪 arXiv 新论文，筛选感兴趣的领域，生成中文摘要和关键发现卡片。",
    category: "knowledge",
    difficulty: "advanced",
    tags: ["论文", "arXiv", "AI 摘要", "学术"],
    scenario: "作为 AI 研究者，你需要持续追踪 arXiv 上的最新论文。每天新增数百篇论文，逐一阅读不现实。需要一个自动化方案来筛选、摘要和整理你关注领域的论文。",
    steps: [
      "配置 arXiv 关注的论文分类和关键词",
      "每日定时爬取新论文元数据",
      "使用 AI 进行相关性评分和筛选",
      "为高分论文生成结构化中文摘要",
      "生成知识卡片并归档到 Notion 数据库",
    ],
    configSnippet: `trigger:
  schedule: "0 9 * * 1-5"
sources:
  - type: arxiv
    categories: ["cs.AI", "cs.CL", "cs.LG"]
    keywords: ["LLM", "agent", "RAG"]
filter:
  model: gpt-4o-mini
  min_relevance: 0.7
processor:
  model: gpt-4o
  output_format: knowledge_card
storage:
  type: notion
  database: "论文库"
  properties:
    - title
    - authors
    - summary_zh
    - key_findings
    - relevance_score`,
    effect: "每周论文追踪时间从 5 小时降至 30 分钟，重要论文零遗漏。",
    author: "张博士",
    authorInfo: {
      name: "张博士",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhangphd",
      github: "https://github.com/zhang-research",
      bio: "AI 研究员，专注 NLP 与 Agent 方向。",
    },
    githubStats: { stars: 3120, forks: 890, issues: 15, lastUpdated: "2026-02-22", repoUrl: "https://github.com/zhang-research/paper-reading-assistant" },
    skillIds: ["web-scraper", "ai-summarizer", "notion-sync"],
    i18n: {
      title_en: "Paper Reading Assistant",
      description_en: "Automatically track new arXiv papers, filter by interests, generate Chinese summaries and key findings cards.",
      scenario_en: "As an AI researcher, you need to continuously track the latest papers on arXiv. With hundreds of new papers daily, reading each one is impractical. You need an automated solution to filter, summarize, and organize papers in your field of interest.",
      steps_en: [
        "Configure arXiv paper categories and keywords to follow",
        "Set up daily crawling of new paper metadata",
        "Use AI for relevance scoring and filtering",
        "Generate structured Chinese summaries for high-scoring papers",
        "Create knowledge cards and archive to Notion database",
      ],
      effect_en: "Weekly paper tracking time reduced from 5 hours to 30 minutes, zero missed important papers.",
    },
    lang: "zh",
    verified: true,
  },
  {
    id: "github-star-curator",
    title: "GitHub Star 智能分类",
    description: "自动分析你 Star 过的仓库，按用途智能分类，生成个人工具库索引。",
    category: "knowledge",
    difficulty: "beginner",
    tags: ["GitHub", "Star", "分类", "工具库"],
    scenario: "你在 GitHub 上 Star 了上千个仓库，但需要某个工具时却很难找到。Star 列表变成了黑洞，收藏了等于没收藏。",
    steps: [
      "通过 GitHub API 获取所有 Star 仓库列表",
      "抓取每个仓库的 README 和描述信息",
      "使用 AI 分析仓库用途并自动分类",
      "生成分类索引文档",
      "定期更新并推送新增 Star 的分类结果",
    ],
    configSnippet: `trigger:
  schedule: "0 0 * * 0"  # 每周日
source:
  type: github_stars
  username: \${GITHUB_USERNAME}
  token: \${GITHUB_TOKEN}
processor:
  model: gpt-4o-mini
  categories:
    - 前端框架
    - 后端工具
    - AI/ML
    - DevOps
    - 实用工具
    - 学习资源
output:
  type: github_repo
  repo: "my-awesome-stars"
  format: markdown`,
    effect: "Star 仓库检索效率提升 10 倍，工具选型时间大幅缩短。",
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 4560, forks: 1023, issues: 31, lastUpdated: "2026-02-21", repoUrl: "https://github.com/openclaw/github-star-curator" },
    skillIds: ["github-api", "ai-classifier", "markdown-parser"],
    i18n: {
      title_en: "GitHub Star Smart Curator",
      description_en: "Automatically analyze your starred repositories, intelligently categorize by purpose, and generate a personal tool library index.",
      scenario_en: "You've starred thousands of repos on GitHub, but can't find the right tool when needed. Your star list has become a black hole - starring is the same as not starring.",
      steps_en: [
        "Fetch all starred repository list via GitHub API",
        "Scrape README and description for each repository",
        "Use AI to analyze repository purpose and auto-categorize",
        "Generate categorized index document",
        "Periodically update and push classification results for new stars",
      ],
      effect_en: "Star repository retrieval efficiency improved 10x, tool selection time significantly reduced.",
    },
    lang: "zh",
    verified: true,
  },
  {
    id: "social-reply-bot",
    title: "社交平台智能回复助手",
    description: "监控社交平台评论和私信，使用 AI 生成个性化回复建议，一键发送。",
    category: "social",
    difficulty: "intermediate",
    tags: ["社交媒体", "自动回复", "客服", "AI"],
    scenario: "你运营一个技术社区账号，每天收到大量评论和私信。手动逐条回复效率低，但又不想用千篇一律的模板回复影响用户体验。",
    steps: [
      "配置社交平台账号授权",
      "实时监控新评论和私信",
      "使用 AI 分析消息意图和情感",
      "根据上下文生成个性化回复建议",
      "人工确认后一键发送",
    ],
    configSnippet: `trigger:
  event: new_message
  platforms:
    - twitter
    - weibo
processor:
  model: gpt-4o
  context:
    brand_voice: "专业友好"
    knowledge_base: "./docs/faq.md"
  mode: suggest  # suggest | auto
output:
  type: dashboard
  approval: required`,
    effect: "回复效率提升 5 倍，用户满意度从 72% 提升至 91%。",
    author: "陈运营",
    authorInfo: {
      name: "陈运营",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=chenops",
      github: "https://github.com/chen-ops",
      bio: "社交媒体运营专家，自动化营销实践者。",
    },
    githubStats: { stars: 956, forks: 178, issues: 6, lastUpdated: "2026-02-17" },
    skillIds: ["web-scraper", "ai-summarizer", "scheduler"],
    lang: "zh",
    verified: true,
  },
  {
    id: "design-asset-generator",
    title: "批量设计素材生成",
    description: "根据品牌规范和文案，自动生成社交媒体封面图、Banner 和配图。",
    category: "creative",
    difficulty: "advanced",
    tags: ["设计", "AIGC", "品牌", "社交媒体"],
    scenario: "你的团队需要为多个社交平台定期生产营销配图，但设计师资源有限。每次都要手动调整尺寸和布局，重复劳动占据大量时间。",
    steps: [
      "定义品牌设计规范（色彩、字体、Logo 位置）",
      "上传文案列表和素材资源",
      "配置各平台的尺寸模板",
      "使用 AI 生成设计稿",
      "导出多平台适配的图片资源",
    ],
    configSnippet: `trigger:
  event: new_campaign
brand:
  colors: ["#00D9A6", "#1a1a2e"]
  font: "Noto Sans SC"
  logo: "./assets/logo.png"
templates:
  - platform: wechat
    size: "900x383"
  - platform: weibo
    size: "1000x562"
  - platform: twitter
    size: "1200x675"
generator:
  model: dall-e-3
  style: brand_consistent
output:
  folder: "./output/{campaign}/{platform}"`,
    effect: "设计素材产出速度提升 8 倍，品牌一致性保证 100%。",
    author: "刘设计",
    authorInfo: {
      name: "刘设计",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=liudesign",
      github: "https://github.com/liu-design",
      bio: "UI/UX 设计师，AIGC 设计探索者。",
    },
    githubStats: { stars: 1890, forks: 345, issues: 19, lastUpdated: "2026-02-19" },
    skillIds: ["image-uploader", "ai-image-gen", "multi-platform-publisher"],
    lang: "zh",
    verified: true,
  },
  {
    id: "email-auto-sorter",
    title: "邮件智能分类与摘要",
    description: "自动分析收件箱邮件，按优先级分类，为长邮件生成摘要，标记需要回复的邮件。",
    category: "efficiency",
    difficulty: "beginner",
    tags: ["邮件", "分类", "摘要", "优先级"],
    scenario: "每天收到 50+ 封邮件，其中大量是通知类邮件、营销邮件。重要邮件容易被淹没，经常错过需要及时回复的信息。",
    steps: [
      "连接邮箱 IMAP/API",
      "配置分类规则和优先级权重",
      "AI 分析邮件内容并自动分类",
      "为长邮件生成一句话摘要",
      "高优先级邮件通过即时通讯工具提醒",
    ],
    configSnippet: `trigger:
  event: new_email
  interval: 5m
source:
  type: imap
  host: imap.gmail.com
  auth: oauth2
categories:
  urgent: "需要24小时内回复"
  important: "本周需要处理"
  info: "了解即可"
  spam: "营销/垃圾邮件"
processor:
  model: gpt-4o-mini
  summarize: true
  max_summary_length: 100
notify:
  urgent:
    type: feishu
    immediate: true`,
    effect: "邮件处理时间减少 60%，重要邮件响应速度提升 3 倍。",
    author: "OpenClaw 团队",
    authorInfo: {
      name: "OpenClaw 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openclaw",
      github: "https://github.com/openclaw",
      bio: "OpenClaw 核心开发团队，致力于打造最好用的 AI 自动化平台。",
    },
    githubStats: { stars: 2100, forks: 412, issues: 9, lastUpdated: "2026-02-20" },
    skillIds: ["email-connector", "ai-classifier", "feishu-bot"],
    lang: "zh",
    verified: true,
  },
  {
    id: "code-review-assistant",
    title: "代码审查自动化助手",
    description: "监控 GitHub PR，自动进行代码质量分析和安全检查，生成结构化审查报告。",
    category: "efficiency",
    difficulty: "advanced",
    tags: ["GitHub", "代码审查", "CI/CD", "安全"],
    scenario: "团队代码审查积压严重，高级工程师的时间大量消耗在重复性审查上。一些基础的代码规范、安全漏洞、性能问题可以通过自动化先行筛查。",
    steps: [
      "配置 GitHub App 并授权仓库访问",
      "设置审查规则和检查项",
      "PR 创建时自动触发 AI 分析",
      "生成结构化审查报告（安全、性能、规范）",
      "在 PR 中以评论形式反馈",
    ],
    configSnippet: `trigger:
  event: pull_request
  actions: [opened, synchronize]
  repo: \${GITHUB_REPO}
rules:
  security:
    - sql_injection
    - xss
    - secrets_leak
  performance:
    - n_plus_one
    - memory_leak
  style:
    - naming_convention
    - code_complexity
processor:
  model: gpt-4o
  context_window: full_diff
output:
  type: github_review
  severity_labels: true`,
    effect: "代码审查周期缩短 50%，安全漏洞检出率提升 70%。",
    author: "赵架构师",
    authorInfo: {
      name: "赵架构师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhaoarch",
      github: "https://github.com/zhao-arch",
      bio: "架构师，代码质量与 DevOps 实践专家。",
    },
    githubStats: { stars: 5670, forks: 1234, issues: 45, lastUpdated: "2026-02-22", repoUrl: "https://github.com/zhao-arch/code-review-assistant" },
    skillIds: ["github-api", "ai-summarizer", "scheduler"],
    i18n: {
      title_en: "Code Review Automation Assistant",
      description_en: "Monitor GitHub PRs, automatically perform code quality analysis and security checks, generate structured review reports.",
      scenario_en: "Team code reviews are severely backlogged, senior engineers spend too much time on repetitive reviews. Basic code standards, security vulnerabilities, and performance issues can be pre-screened through automation.",
      steps_en: [
        "Configure GitHub App and authorize repository access",
        "Set up review rules and check items",
        "Auto-trigger AI analysis on PR creation",
        "Generate structured review report (security, performance, standards)",
        "Post feedback as comments on the PR",
      ],
      effect_en: "Code review cycle reduced by 50%, security vulnerability detection rate improved by 70%.",
    },
    lang: "zh",
    verified: true,
  },
  {
    id: "bookmark-knowledge-base",
    title: "浏览器书签知识库",
    description: "自动抓取书签页面内容，生成摘要和标签，构建可搜索的个人知识库。",
    category: "knowledge",
    difficulty: "intermediate",
    tags: ["书签", "知识库", "搜索", "笔记"],
    scenario: "浏览器书签收藏了数千个网页，但搜索功能弱，标签混乱，大部分收藏后再也没打开过。需要一个智能知识库来管理和检索这些信息。",
    steps: [
      "导出浏览器书签数据",
      "批量抓取书签页面的核心内容",
      "使用 AI 生成摘要和智能标签",
      "建立向量索引支持语义搜索",
      "部署轻量级搜索 Web 界面",
    ],
    configSnippet: `trigger:
  - event: bookmark_export
  - schedule: "0 2 * * 0"  # 每周增量
source:
  type: chrome_bookmarks
  file: "./bookmarks.html"
processor:
  - action: fetch_content
    timeout: 10s
    retry: 2
  - action: summarize
    model: gpt-4o-mini
  - action: auto_tag
    max_tags: 5
storage:
  type: vector_db
  provider: chroma
  collection: bookmarks
search:
  type: web_ui
  port: 3001`,
    effect: "知识检索成功率从 15% 提升至 85%，旧书签重新焕发价值。",
    author: "吴工程师",
    authorInfo: {
      name: "吴工程师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=wueng",
      github: "https://github.com/wu-engineer",
      bio: "前端工程师，个人知识管理爱好者。",
    },
    githubStats: { stars: 1560, forks: 287, issues: 11, lastUpdated: "2026-02-16" },
    skillIds: ["web-scraper", "ai-summarizer", "vector-db"],
    lang: "zh",
    verified: true,
  },
  {
    id: "content-calendar-ai",
    title: "内容日历 AI 规划",
    description: "基于行业趋势和历史数据，AI 自动生成内容创作日历和选题建议。",
    category: "creative",
    difficulty: "intermediate",
    tags: ["内容运营", "选题", "日历", "趋势"],
    scenario: "作为内容团队负责人，每月需要规划 20+ 篇内容的选题、发布时间和平台。手动调研行业趋势、竞品内容、热点话题耗时巨大。",
    steps: [
      "配置行业关键词和竞品账号列表",
      "自动爬取行业趋势和热点数据",
      "AI 分析数据并生成选题推荐",
      "根据历史表现优化发布时间",
      "输出到日历工具（Google Calendar / Notion）",
    ],
    configSnippet: `trigger:
  schedule: "0 10 1 * *"  # 每月1号
sources:
  - type: trend
    platforms: [baidu, weixin, zhihu]
    keywords: \${INDUSTRY_KEYWORDS}
  - type: competitor
    accounts: \${COMPETITOR_LIST}
  - type: history
    analytics: \${GA_PROPERTY}
planner:
  model: gpt-4o
  monthly_posts: 20
  content_pillars:
    - 教程
    - 案例
    - 观点
    - 工具推荐
output:
  type: notion_calendar
  database: "内容日历"`,
    effect: "选题规划时间从 2 天缩短至 1 小时，内容互动率提升 35%。",
    author: "周内容",
    authorInfo: {
      name: "周内容",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhoucontent",
      github: "https://github.com/zhou-content",
      bio: "内容运营负责人，数据驱动的内容策略专家。",
    },
    githubStats: { stars: 780, forks: 156, issues: 5, lastUpdated: "2026-02-14" },
    skillIds: ["web-scraper", "ai-summarizer", "notion-sync"],
    lang: "zh",
    verified: true,
  },
  {
    id: "competitor-monitor",
    title: "竞品动态监控系统",
    description: "自动追踪竞���产品更新、价格变化、内容发布，生成竞争分析报告。",
    category: "social",
    difficulty: "advanced",
    tags: ["竞品分析", "监控", "报告", "市场"],
    scenario: "产品经理需要持续关注竞品动态，但手动检查多个竞品的官网、社交媒体、应用商店更新非常耗时且容易遗漏。",
    steps: [
      "配置竞品列表（官网、社交账号、应用商店链接）",
      "设置多渠道定时监控任务",
      "AI 检测变化并分类（功能更新、定价、营销活动）",
      "生成差异对比和趋势分析",
      "定期输出竞争分析报告",
    ],
    configSnippet: `trigger:
  schedule: "0 */6 * * *"
targets:
  - name: "竞品A"
    website: "https://competitor-a.com"
    twitter: "@competitor_a"
    app_store: "id123456"
  - name: "竞品B"
    website: "https://competitor-b.com"
detection:
  - pricing_changes
  - feature_updates
  - blog_posts
  - social_campaigns
analyzer:
  model: gpt-4o
  report_format: executive_summary
output:
  - type: feishu_doc
    schedule: weekly
  - type: alert
    trigger: major_change`,
    effect: "竞品信息覆盖率 100%，战略响应时间从数周缩短至数小时。",
    author: "孙产品",
    authorInfo: {
      name: "孙产品",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=sunpm",
      github: "https://github.com/sun-pm",
      bio: "高级产品经理，竞品分析与市场策略专家。",
    },
    githubStats: { stars: 1120, forks: 198, issues: 14, lastUpdated: "2026-02-21", repoUrl: "https://github.com/sun-pm/competitor-monitor" },
    skillIds: ["web-scraper", "ai-classifier", "scheduler", "feishu-bot"],
    lang: "zh",
    verified: true,
  },
]

export function getUsecaseById(id: string): UseCase | undefined {
  return usecases.find((uc) => uc.id === id)
}

export function getUsecasesByCategory(category: Category): UseCase[] {
  return usecases.filter((uc) => uc.category === category)
}

export const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "入门", color: "text-emerald-400" },
  intermediate: { label: "进阶", color: "text-amber-400" },
  advanced: { label: "高级", color: "text-rose-400" },
}
