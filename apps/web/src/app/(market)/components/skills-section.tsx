"use client"

import { skillCategories, type Skill } from "@/lib/types"
import {
  Database,
  Brain,
  Plug,
  FileOutput,
  Wrench,
  ArrowRight,
  BadgeCheck,
  Tag,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PriceTag } from "./price-tag"
import { trpc } from "@/lib/trpc/client"
import { mapSkillListRowToSkill } from "../lib/map-marketplace"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { Button } from "@repo/ui/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

/** 首页推荐展示数量 */
const FEATURED_SKILLS_COUNT = 6

const categoryIcons: Record<string, React.ReactNode> = {
  Database: <Database className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Plug: <Plug className="h-4 w-4" />,
  FileOutput: <FileOutput className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
}

function SkillCard({ skill }: { skill: Skill }) {
  const cat = skillCategories[skill.category] ?? skillCategories["general-tools"]

  return (
    <Link
      href={`/skills/${skill.slug ?? skill.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-accent/50"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {categoryIcons[cat.icon]}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {skill.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            v{skill.version}
          </span>
          <PriceTag price={skill?.price ?? 0} />
        </div>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {skill.name}
      </h3>
      <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {skill.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(skill.tags ?? []).slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
        {(skill.tags?.length ?? 0) > 3 && (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            +{(skill.tags?.length ?? 0) - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          {skill.authorInfo?.avatar ? (
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-secondary">
              <Image
                src={skill.authorInfo.avatar}
                alt={skill.authorInfo.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
              {(skill.authorInfo?.name ?? "?").charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {skill.authorInfo?.name ?? ""}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          查看详情
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

export function SkillsSection() {
  const { data, isLoading, error, refetch } = trpc.marketplaceSkills.list.useQuery(
    { limit: FEATURED_SKILLS_COUNT },
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 }
  )

  if (isLoading) {
    return (
      <section id="skills" className="border-border py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">Skills</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Skills 技能组件</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                可复用的自动化技能组件，支持数据采集、AI 处理、平台集成与内容输出。一键安装，快速搭建工作流。
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_SKILLS_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="skills" className="border-border py-16">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>
              获取 Skills 列表时出现错误
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                重试
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  const skills = (data?.items ?? []).map(mapSkillListRowToSkill)

  return (
    <section id="skills" className="border-border py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">Skills</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Skills 技能组件</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              可复用的自动化技能组件，支持数据采集、AI 处理、平台集成与内容输出。一键安装，快速搭建工作流。
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>创作者获得</span>
            <span className="font-bold text-primary">90%</span>
            <span>收入分成</span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </section>
  )
}
