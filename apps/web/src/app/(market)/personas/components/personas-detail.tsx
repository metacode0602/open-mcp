"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import {
  ArrowLeft,
  Users,
  Sparkles,
  Zap,
  BookOpen,
  BadgeCheck,
  ChevronRight,
  Star,
  GitFork,
  CircleDot,
  Clock,
  Globe,
  ExternalLink,
  Database,
  Brain,
  Plug,
  FileOutput,
  Wrench,
  ArrowRight,
  Crown,
  Code,
  Megaphone,
  Headphones,
  Settings,
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { PriceTag } from "../../components/price-tag"
import { PurchaseButton } from "../../components/purchase-button"
import {
  personaCategories,
  difficultyLabels,
  type Persona,
} from "@/lib/types/personas"
import { getSkillsByIds, skillCategories, type Skill } from "@/lib/types/skills"
import { mapPersonaApiToPersona } from "@/lib/marketplace-dto"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@repo/ui/lib/utils"

const categoryIcons: Record<string, React.ReactNode> = {
  Users: <Users className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Headphones: <Headphones className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
}

const skillCatIcons: Record<string, React.ReactNode> = {
  Database: <Database className="h-3.5 w-3.5" />,
  Brain: <Brain className="h-3.5 w-3.5" />,
  Plug: <Plug className="h-3.5 w-3.5" />,
  FileOutput: <FileOutput className="h-3.5 w-3.5" />,
  Wrench: <Wrench className="h-3.5 w-3.5" />,
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k"
  return n.toString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toLocaleDateString("zh-CN")
}

const PersonaDetailSkeleton = () => (
  <div className="mx-auto max-w-4xl px-6 py-10">
    <div className="mb-8 h-5 w-48 animate-pulse rounded bg-muted" />
    <div className="mb-6 h-10 w-64 animate-pulse rounded bg-muted" />
    <div className="space-y-4">
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  </div>
)

type PersonaDetailProps =
  | { slug: string; persona?: never }
  | { slug?: never; persona: Persona }

export function PersonaDetail(props: PersonaDetailProps) {
  const [displayLang, setDisplayLang] = useState<"zh" | "en">("zh")

  const { data: apiData, isLoading, error } = trpc.marketplacePersonas.getBySlug.useQuery(
    { slug: props.slug! },
    { enabled: !!props.slug }
  )

  const persona: Persona | null = props.persona
    ? props.persona
    : apiData
      ? mapPersonaApiToPersona(apiData as Parameters<typeof mapPersonaApiToPersona>[0])
      : null

  if (props.slug) {
    if (isLoading) return <PersonaDetailSkeleton />
    if (error)
      return (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">加载失败</h2>
          <p className="mb-6 text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            重试
          </Button>
        </div>
      )
    if (!persona)
      return (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-2 text-2xl font-bold">配置包不存在</h2>
          <p className="mb-6 text-muted-foreground">未找到该配置包，可能已被删除或从未存在。</p>
          <Button asChild>
            <Link href="/personas">返回 AI 员工</Link>
          </Button>
        </div>
      )
  } else if (!persona) {
    return null
  }

  const cat = personaCategories[persona.category]
  const diff = persona.difficulty ? difficultyLabels[persona.difficulty] : null
  const hasEnglish = persona.i18n && persona.i18n.name_en

  const name =
    displayLang === "en" && persona.i18n?.name_en ? persona.i18n.name_en : persona.name
  const description =
    displayLang === "en" && persona.i18n?.description_en
      ? persona.i18n.description_en
      : persona.description
  const scenario =
    persona.scenario &&
    (displayLang === "en" && persona.i18n?.scenario_en
      ? persona.i18n.scenario_en
      : persona.scenario)
  const steps =
    persona.steps &&
    (displayLang === "en" && persona.i18n?.steps_en
      ? persona.i18n.steps_en
      : persona.steps)
  const effect =
    persona.effect &&
    (displayLang === "en" && persona.i18n?.effect_en
      ? persona.i18n.effect_en
      : persona.effect)

  const relatedSkillsFromApi = persona.relatedSkills
  const relatedSkillsFull = persona.skillIds ? getSkillsByIds(persona.skillIds) : []
  const hasRelatedFromApi = relatedSkillsFromApi && relatedSkillsFromApi.length > 0
  const relatedSkills = hasRelatedFromApi ? relatedSkillsFromApi : relatedSkillsFull

  const sectionLabels = {
    scenario: displayLang === "en" ? "Scenario" : "场景描述",
    steps: displayLang === "en" ? "Implementation Steps" : "实现步骤",
    config: displayLang === "en" ? "Configuration" : "配置文件",
    effect: displayLang === "en" ? "Results" : "效果展示",
    author: displayLang === "en" ? "Author" : "作者信息",
    github: displayLang === "en" ? "Repository Stats" : "仓库统计",
    back: displayLang === "en" ? "Back to Personas" : "返回 AI 员工",
    personas: displayLang === "en" ? "Personas" : "AI 员工配置包",
    verified: displayLang === "en" ? "Verified" : "已验证",
    submit: displayLang === "en" ? "Submit Your Persona" : "提交你的配置包",
    viewRepo: displayLang === "en" ? "View Repo" : "查看仓库",
    usedSkills: displayLang === "en" ? "Used Skills" : "使用的 Skills",
    features: displayLang === "en" ? "Features" : "核心能力",
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/personas" className="transition-colors hover:text-foreground">
          {sectionLabels.personas}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{name}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/personas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {sectionLabels.back}
        </Link>

        {hasEnglish && (
          <button
            onClick={() => setDisplayLang(displayLang === "zh" ? "en" : "zh")}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {displayLang === "zh" ? "English" : "中文"}
          </button>
        )}
      </div>

      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-primary">
            {categoryIcons[cat.icon]}
            <span className="text-sm font-medium">{cat.label}</span>
          </div>
          {diff && (
            <span className={cn("text-sm font-medium", diff.color)}>
              {diff.label}
            </span>
          )}
          {persona.verified && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <BadgeCheck className="h-4 w-4" />
              {sectionLabels.verified}
            </span>
          )}
        </div>

        <h1 className="mb-2 text-balance text-3xl font-bold text-foreground md:text-4xl">
          {name}
        </h1>
        {persona.subtitle && (
          <p className="mb-4 text-lg text-muted-foreground">{persona.subtitle}</p>
        )}
        <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {persona.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
          <PriceTag price={persona.price} size="lg" />
          <PurchaseButton
            price={persona.price}
            itemName={name}
            itemType="persona"
            className="flex-1 sm:flex-none"
          />
          <span className="text-xs text-muted-foreground">
            {"creator gets 90%"}
          </span>
        </div>
      </div>

      {/* Features (always show for Persona) */}
      {persona.features.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            {sectionLabels.features}
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <ul className="flex flex-col gap-3">
              {persona.features.map((f, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-muted-foreground"
                >
                  <span className="text-primary">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Author Card + GitHub Stats */}
      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {sectionLabels.author}
          </h3>
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-secondary">
              {persona.authorInfo.avatar ? (
                <Image
                  src={persona.authorInfo.avatar}
                  alt={persona.authorInfo.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                  {persona.authorInfo.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                {persona.authorInfo.name}
              </span>
              {persona.authorInfo.bio && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {persona.authorInfo.bio}
                </p>
              )}
              {persona.authorInfo.github && (
                <a
                  href={persona.authorInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  <ExternalLink className="h-3 w-3" />
                  GitHub Profile
                </a>
              )}
            </div>
          </div>
        </div>

        {persona.githubStats && (
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {sectionLabels.github}
              </h3>
              {persona.githubStats.repoUrl && (
                <a
                  href={persona.githubStats.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                >
                  {sectionLabels.viewRepo}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <Star className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(persona.githubStats.stars)}
                  </p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <GitFork className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatNumber(persona.githubStats.forks)}
                  </p>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <CircleDot className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {persona.githubStats.issues}
                  </p>
                  <p className="text-xs text-muted-foreground">Issues</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(persona.githubStats.lastUpdated)}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scenario (optional) */}
      {scenario && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {persona.features.length > 0 ? 2 : 1}
            </span>
            {sectionLabels.scenario}
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="leading-relaxed text-muted-foreground">{scenario}</p>
          </div>
        </section>
      )}

      {/* Steps (optional) */}
      {steps && steps.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {persona.features.length > 0 ? 3 : 2}
            </span>
            {sectionLabels.steps}
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <ol className="flex flex-col gap-4">
              {steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-sm font-medium text-foreground">
                    {i + 1}
                  </div>
                  <p className="pt-1 leading-relaxed text-muted-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Config (optional) */}
      {persona.configSnippet && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {persona.features.length > 0 ? 4 : 3}
            </span>
            {sectionLabels.config}
          </h2>
          <div className="relative rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-xs text-muted-foreground">
                config.yaml
              </span>
              <CopyButton text={persona.configSnippet} />
            </div>
            <pre className="overflow-x-auto p-6">
              <code className="font-mono text-sm leading-relaxed text-muted-foreground">
                {persona.configSnippet}
              </code>
            </pre>
          </div>
        </section>
      )}

      {/* Effect (optional) */}
      {effect && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {persona.features.length > 0 ? 5 : 4}
            </span>
            {sectionLabels.effect}
          </h2>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {effect}
            </p>
          </div>
        </section>
      )}

      {/* Used Skills */}
      {relatedSkills.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {persona.features.length > 0 ? 6 : 5}
            </span>
            {sectionLabels.usedSkills}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hasRelatedFromApi
              ? (relatedSkills as { id: string; name: string; slug: string }[]).map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-accent/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Plug className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                        {skill.name}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))
              : (relatedSkills as Skill[]).map((skill) => {
                  const sCat = skillCategories[skill.category]
                  return (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-accent/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {skillCatIcons[sCat.icon]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {skill.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {sCat.label} &middot; v{skill.version}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  )
                })}
          </div>
        </section>
      )}

      <div className="flex items-center justify-center">
        <Link
          href="/contribute"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {sectionLabels.submit}
        </Link>
      </div>
    </div>
  )
}
