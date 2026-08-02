"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import {
  ArrowLeft,
  Database,
  Brain,
  Plug,
  FileOutput,
  Wrench,
  BadgeCheck,
  ChevronRight,
  Star,
  GitFork,
  CircleDot,
  Clock,
  Globe,
  ExternalLink,
  Terminal,
  Tag,
  ArrowRight,
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { PriceTag } from "../../components/price-tag"
import { PurchaseButton } from "../../components/purchase-button"
import { type Skill } from "@/lib/types"
import { getPersonaById, type Persona } from "@/lib/types/personas"
import { mapSkillApiToSkill, SkillDetailApi } from "@/lib/marketplace-dto"
import { useSkillCategories } from "@/lib/use-marketplace-categories"
import { trpc } from "@/lib/trpc/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { MarkdownReadonly } from "@repo/ui/components/markdown/markdown-readonly"

const categoryIcons: Record<string, React.ReactNode> = {
  Database: <Database className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Plug: <Plug className="h-5 w-5" />,
  FileOutput: <FileOutput className="h-5 w-5" />,
  Wrench: <Wrench className="h-5 w-5" />,
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

const SkillDetailSkeleton = () => (
  <div className="mx-auto max-w-7xl px-6 py-10">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  </div>
)

type SkillDetailProps = { slug: string; skill?: never } | { slug?: never; skill: Skill }

export function SkillDetail(props: SkillDetailProps) {
  const [displayLang, setDisplayLang] = useState<"zh" | "en">("zh")
  const { categories: skillCategories } = useSkillCategories()

  const { data: apiData, isLoading, error } = trpc.marketplaceSkills.getBySlug.useQuery(
    { slug: props.slug! },
    { enabled: !!props.slug }
  )

  const skill: Skill | null = props.skill
    ? props.skill
    : apiData
      ? mapSkillApiToSkill(apiData as unknown as SkillDetailApi)
      : null

  if (props.slug) {
    if (isLoading) return <SkillDetailSkeleton />
    if (error)
      return (
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-xl font-semibold">加载失败</h2>
          <p className="mb-6 text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            重试
          </Button>
        </div>
      )
    if (!skill)
      return (
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="mb-2 text-2xl font-bold">Skill 不存在</h2>
          <p className="mb-6 text-muted-foreground">未找到该 Skill，可能已被删除或从未存在。</p>
          <Button asChild>
            <Link href="/skills">返回 Skills</Link>
          </Button>
        </div>
      )
  } else if (!skill) {
    return null
  }

  const skillValues = Object.values(skillCategories)
  const defaultCat =
    skillValues[0] != null
      ? { label: skillValues[0].label, icon: skillValues[0].icon }
      : { label: "其他", icon: "Wrench" }
  const cat = skillCategories[skill.category] ?? defaultCat
  const hasEnglish = skill.i18n && skill.i18n.name_en

  const name = displayLang === "en" && skill.i18n?.name_en ? skill.i18n.name_en : skill.name
  const description = displayLang === "en" && skill.i18n?.description_en ? skill.i18n.description_en : skill.descriptionZh ?? skill.description
  const longDescription = displayLang === "en" && skill.i18n?.longDescription_en ? skill.i18n.longDescription_en : skill.longDescription

  const relatedPersonasFromApi = skill.relatedPersonas
  const relatedPersonasFull: Persona[] = skill.personaIds
    ? skill.personaIds.map((id) => getPersonaById(id)).filter((p): p is Persona => p != null)
    : []
  const hasRelatedFromApi = relatedPersonasFromApi && relatedPersonasFromApi.length > 0
  const relatedPersonas = hasRelatedFromApi ? relatedPersonasFromApi : relatedPersonasFull

  const labels = {
    back: displayLang === "en" ? "Back to Skills" : "返回 Skills 仓库",
    skills: displayLang === "en" ? "Skills" : "Skills 仓库",
    verified: displayLang === "en" ? "Verified" : "已验证",
    author: displayLang === "en" ? "Author" : "作者信息",
    github: displayLang === "en" ? "Repository Stats" : "仓库统计",
    viewRepo: displayLang === "en" ? "View Repo" : "查看仓库",
    install: displayLang === "en" ? "Installation" : "安装使用",
    config: displayLang === "en" ? "Configuration Example" : "配置示例",
    relatedCases: displayLang === "en" ? "Related Personas" : "使用该 Skill 的 AI 员工",
    overview: displayLang === "en" ? "Overview" : "概览",
    descriptionLabel: displayLang === "en" ? "Description" : "描述",
    readme: displayLang === "en" ? "Readme" : "README",
    longDescription: displayLang === "en" ? "Long Description" : "功能说明",
    features: displayLang === "en" ? "Features" : "功能特性",
    scenario: displayLang === "en" ? "Scenario" : "应用场景",
    submitSkill: displayLang === "en" ? "Submit Your Skill" : "提交你的 Skill",
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* 左侧主内容 */}
        <div className="min-w-0">
          {/* Breadcrumb: Skills -> 分类(name/slug) -> 当前 Skill */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/skills" className="transition-colors hover:text-foreground">
              {labels.skills}
            </Link>
            {skill.categoryInfo && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                <Link
                  href={`/skills?category=${encodeURIComponent(skill.categoryInfo.slug)}`}
                  className="transition-colors hover:text-foreground"
                >
                  {skill.categoryInfo.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground">{name}</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-primary">
                {categoryIcons[cat.icon] ?? categoryIcons.Wrench}
                <span className="text-sm font-medium">{cat.label}</span>
              </div>
              <span className="rounded-md bg-secondary px-2.5 py-1 font-mono text-sm text-muted-foreground">
                v{skill.version}
              </span>
              {skill.verified && (
                <span className="flex items-center gap-1 text-sm text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  {labels.verified}
                </span>
              )}
            </div>

            <h1 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
              {name}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              {labels.longDescription}
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <MarkdownReadonly>{longDescription}</MarkdownReadonly>
            </div>
          </section>

          {/* 功能特性：来自 DB features */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              {labels.features}
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              {skill.features?.length ? (
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {skill.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">暂无功能特性说明</p>
              )}
            </div>
          </section>

          {/* 应用场景：来自 DB scenario */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              {labels.scenario}
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <MarkdownReadonly>{skill.scenario ?? ""}</MarkdownReadonly>
            </div>
          </section>

          {/* README 文档 */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                4
              </span>
              {labels.readme}
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">

              {(skill.readme ?? skill.readmeZh) ? (
                <Tabs
                  defaultValue={skill.readmeZh ? "readmeZh" : "readme"}
                  className="mb-10 mt-10"
                >
                  <TabsList className="mb-4">
                    {skill.readmeZh && (
                      <TabsTrigger value="readmeZh">中文文档</TabsTrigger>
                    )}
                    {skill.readme && (
                      <TabsTrigger value="readme">原文</TabsTrigger>
                    )}
                  </TabsList>
                  {skill.readme && (
                    <TabsContent value="readme" className="mt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <MarkdownReadonly>{skill.readme}</MarkdownReadonly>
                      </div>
                    </TabsContent>
                  )}
                  {skill.readmeZh && (
                    <TabsContent value="readmeZh" className="mt-4">
                      <div className="prose dark:prose-invert max-w-none">
                        <MarkdownReadonly>{skill.readmeZh}</MarkdownReadonly>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              ) : null}
            </div>

          </section>

          {/* Installation */}
          {skill.installCommand && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                {labels.install}
              </h2>
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">terminal</span>
                  </div>
                  <CopyButton text={skill.installCommand} />
                </div>
                <pre className="overflow-x-auto p-6">
                  <code className="font-mono text-sm text-primary">
                    {'$ '}{skill.installCommand}
                  </code>
                </pre>
              </div>
            </section>
          )}

          {/* Config Example */}
          {skill.configExample && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  3
                </span>
                {labels.config}
              </h2>
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="font-mono text-xs text-muted-foreground">config.yaml</span>
                  <CopyButton text={skill.configExample} />
                </div>
                <pre className="overflow-x-auto p-6">
                  <code className="font-mono text-sm leading-relaxed text-muted-foreground">
                    {skill.configExample}
                  </code>
                </pre>
              </div>
            </section>
          )}

          {/* Related Personas */}
          {relatedPersonas.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  4
                </span>
                {labels.relatedCases}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {hasRelatedFromApi
                  ? (relatedPersonas as { id: string; name: string; slug: string }[]).map((p) => (
                    <Link
                      key={p.id}
                      href={`/personas/${p.slug}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-accent/50"
                    >
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {p.name}
                        </h4>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  ))
                  : (relatedPersonas as Persona[]).map((p) => (
                    <Link
                      key={p.id}
                      href={`/personas/${p.slug ?? p.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:bg-accent/50"
                    >
                      <div className="flex-1">
                        <h4 className="mb-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {p.name}
                        </h4>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </Link>
                  ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <div className="flex items-center justify-center">
            <Link
              href="/skills/submit"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {labels.submitSkill}
            </Link>
          </div>
        </div>

        {/* 右侧栏：价格、作者、GitHub */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Price + Purchase */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <PriceTag price={skill.price ?? 0} size="lg" />
            <PurchaseButton
              price={skill?.price ?? 0}
              itemName={name}
              itemType="skill"
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">
              {"creator gets 90%"}
            </span>
          </div>

          {/* Author Card */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.author}
            </h3>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-secondary">
                {skill.authorInfo.avatar ? (
                  <Image
                    src={skill.authorInfo.avatar}
                    alt={skill.authorInfo.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                    {skill.authorInfo.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-base font-semibold text-foreground">
                  {skill.authorInfo.name}
                </span>
                {skill.authorInfo.bio && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {skill.authorInfo.bio}
                  </p>
                )}
                {skill.authorInfo.github && (
                  <a
                    href={skill.authorInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Stats */}
          {skill.githubStats && (
            <div className="flex flex-col rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {labels.github}
                </h3>
                {skill.githubStats.repoUrl && (
                  <a
                    href={skill.githubStats.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary/80"
                  >
                    {labels.viewRepo}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                  <Star className="h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatNumber(skill.githubStats.stars)}</p>
                    <p className="text-xs text-muted-foreground">Stars</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                  <GitFork className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatNumber(skill.githubStats.forks)}</p>
                    <p className="text-xs text-muted-foreground">Forks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                  <CircleDot className="h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-lg font-bold text-foreground">{skill.githubStats.issues}</p>
                    <p className="text-xs text-muted-foreground">Issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{formatDate(skill.githubStats.lastUpdated)}</p>
                    <p className="text-xs text-muted-foreground">Updated</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
