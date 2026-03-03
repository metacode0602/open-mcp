"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
import { CopyButton } from "@/components/copy-button"
import { PriceTag } from "../../components/price-tag"
import { PurchaseButton } from "../../components/purchase-button"
import { skillCategories, type Skill } from "@/lib/types"
import { getPersonaById, type Persona } from "@/lib/types/personas"

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

export function SkillDetail({ skill }: { skill: Skill }) {
  const [displayLang, setDisplayLang] = useState<"zh" | "en">("zh")

  const cat = skillCategories[skill.category]
  const hasEnglish = skill.i18n && skill.i18n.name_en

  const name = displayLang === "en" && skill.i18n?.name_en ? skill.i18n.name_en : skill.name
  const description = displayLang === "en" && skill.i18n?.description_en ? skill.i18n.description_en : skill.description
  const longDescription = displayLang === "en" && skill.i18n?.longDescription_en ? skill.i18n.longDescription_en : skill.longDescription

  const relatedPersonas: Persona[] = skill.personaIds
    ? skill.personaIds.map((id) => getPersonaById(id)).filter((p): p is Persona => p != null)
    : []

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
    overview: displayLang === "en" ? "Overview" : "详细介绍",
    submitSkill: displayLang === "en" ? "Submit Your Skill" : "提交你的 Skill",
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/skills" className="transition-colors hover:text-foreground">
          {labels.skills}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {labels.back}
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

      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-primary">
            {categoryIcons[cat.icon]}
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

        {/* Price + Purchase */}
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
          <PriceTag price={skill.price ?? 0} size="lg" />
          <PurchaseButton
            price={skill?.price ?? 0}
            itemName={name}
            itemType="skill"
            className="flex-1 sm:flex-none"
          />
          <span className="text-xs text-muted-foreground">
            {"creator gets 90%"}
          </span>
        </div>
      </div>

      {/* Author + GitHub Stats */}
      <div className="mb-10 grid gap-6 md:grid-cols-2">
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
            <div className="flex flex-1 flex-col gap-1">
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
                  <ExternalLink className="h-3 w-3" />
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
                <Star className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">{formatNumber(skill.githubStats.stars)}</p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <GitFork className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">{formatNumber(skill.githubStats.forks)}</p>
                  <p className="text-xs text-muted-foreground">Forks</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <CircleDot className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">{skill.githubStats.issues}</p>
                  <p className="text-xs text-muted-foreground">Issues</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatDate(skill.githubStats.lastUpdated)}</p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            1
          </span>
          {labels.overview}
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="leading-relaxed text-muted-foreground">{longDescription}</p>
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
            {relatedPersonas.map((p) => (
              <Link
                key={p.id}
                href={`/personas/${p.id}`}
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
  )
}
