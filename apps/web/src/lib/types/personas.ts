import type { AuthorInfo, GithubStats } from "./skills"

export interface PersonaI18nContent {
  name_en?: string
  description_en?: string
  scenario_en?: string
  steps_en?: string[]
  effect_en?: string
}

export interface Persona {
  id: string
  name: string
  subtitle: string
  description: string
  category: "leadership" | "engineering" | "marketing" | "support" | "operations"
  tags: string[]
  author: string
  authorInfo: AuthorInfo
  features: string[]
  verified: boolean
  price: number
  /** 可选：场景/步骤/配置/效果（吸纳原 UseCase 字段） */
  scenario?: string
  steps?: string[]
  configSnippet?: string
  effect?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  skillIds?: string[]
  githubStats?: GithubStats
  i18n?: PersonaI18nContent
}

export type PersonaCategory = Persona["category"]

export const personaCategories: Record<PersonaCategory, { label: string; icon: string }> = {
  leadership: { label: "领导力", icon: "Crown" },
  engineering: { label: "工程", icon: "Code" },
  marketing: { label: "营销", icon: "Megaphone" },
  support: { label: "支持", icon: "Headphones" },
  operations: { label: "运营", icon: "Settings" },
}

export const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "入门", color: "text-emerald-400" },
  intermediate: { label: "进阶", color: "text-amber-400" },
  advanced: { label: "高级", color: "text-rose-400" },
}

export const personas: Persona[] = [
  {
    id: "felix-craft",
    name: "Felix Craft",
    subtitle: "AI CEO / 首席幕僚",
    description:
      "完整的 AI CEO 配置包，包含日程管理、邮件处理、决策支持和项目追踪。内置记忆系统和个性化决策框架。",
    category: "leadership",
    tags: ["CEO", "日程", "决策", "邮件"],
    author: "OpenMCP 团队",
    authorInfo: {
      name: "OpenMCP 团队",
      avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=openmcp",
      github: "https://github.com/openmcp",
      bio: "OpenMCP 核心开发团队。",
    },
    features: [
      "智能日程管理与冲突检测",
      "邮件优先级分类与自动回复",
      "项目进度追踪与风险预警",
      "个性化决策建议框架",
    ],
    verified: true,
    price: 99,
  },
  {
    id: "dev-assistant",
    name: "Dev Assistant",
    subtitle: "AI 开发助手",
    description:
      "面向开发团队的 AI 助手配置，涵盖代码审查、技术文档生成、Bug 分析和架构建议。",
    category: "engineering",
    tags: ["代码审查", "文档", "Bug", "架构"],
    author: "赵架构师",
    authorInfo: {
      name: "赵架构师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhaoarch",
      github: "https://github.com/zhao-arch",
      bio: "架构师，代码质量与 DevOps 实践专家。",
    },
    features: [
      "自动代码审查与安全检查",
      "技术文档自动生成",
      "Bug 根因分析与修复建议",
      "架构设计评审辅助",
    ],
    verified: true,
    price: 49,
  },
  {
    id: "content-strategist",
    name: "Content Strategist",
    subtitle: "AI 内容策略师",
    description:
      "内容营销全流程 AI 助手，从选题策划到多平台发布，维护品牌声音一致性。",
    category: "marketing",
    tags: ["内容", "选题", "SEO", "多平台"],
    author: "周内容",
    authorInfo: {
      name: "周内容",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhoucontent",
      github: "https://github.com/zhou-content",
      bio: "内容运营负责人，数据驱动的内容策略专家。",
    },
    features: [
      "行业趋势分析与选题推荐",
      "SEO 优化建议",
      "多平台内容适配与发布",
      "内容效果追踪与复盘",
    ],
    verified: true,
    price: 59,
  },
  {
    id: "customer-hero",
    name: "Customer Hero",
    subtitle: "AI 客服专家",
    description:
      "智能客户支持配置包，多轮对话理解、工单自动分级、知识库智能检索和满意度追踪。",
    category: "support",
    tags: ["客服", "工单", "知识库", "满意度"],
    author: "陈运营",
    authorInfo: {
      name: "陈运营",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=chenops",
      github: "https://github.com/chen-ops",
      bio: "社交媒体运营专家，自动化营销实践者。",
    },
    features: [
      "多轮上下文对话理解",
      "工单自动分级与路由",
      "知识库语义检索",
      "客户满意度实时追踪",
    ],
    verified: true,
    price: 0,
  },
  {
    id: "ops-commander",
    name: "Ops Commander",
    subtitle: "AI 运营管家",
    description:
      "企业运营自动化配置包，涵盖报表自动化、流程监控、异常预警和资源调度。",
    category: "operations",
    tags: ["运营", "报表", "监控", "调度"],
    author: "李工程师",
    authorInfo: {
      name: "李工程师",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=lieng",
      github: "https://github.com/li-engineer",
      bio: "资深后端工程师，企业协作工具爱好者。",
    },
    features: [
      "运营报表自动生成",
      "业务流程异常预警",
      "资源使用分析与调度建议",
      "SLA 达标率实时追踪",
    ],
    verified: true,
    price: 39,
  },
  {
    id: "research-pilot",
    name: "Research Pilot",
    subtitle: "AI 研究助手",
    description:
      "面向研究者的 AI 助手配置，自动追踪论文、竞品动态，生成研究笔记和洞察报告。",
    category: "engineering",
    tags: ["论文", "竞品", "研究", "报告"],
    author: "张博士",
    authorInfo: {
      name: "张博士",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=zhangphd",
      github: "https://github.com/zhang-research",
      bio: "AI 研究员，专注 NLP 与 Agent 方向。",
    },
    features: [
      "arXiv 论文自动追踪与筛选",
      "竞品动态智能监控",
      "结构化研究笔记生成",
      "领域趋势洞察报告",
    ],
    verified: true,
    price: 69,
  },
]

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id)
}
