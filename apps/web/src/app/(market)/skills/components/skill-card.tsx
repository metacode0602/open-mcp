import Link from "next/link"
import Image from "next/image"
import {
  Database,
  Brain,
  Plug,
  FileOutput,
  Wrench,
  ArrowRight,
  BadgeCheck,
  Star,
  Tag,
} from "lucide-react"
import type { Skill } from "@/lib/types"
import { skillCategories } from "@/lib/types"
import { PriceTag } from "../../components/price-tag"

const categoryIcons: Record<string, React.ReactNode> = {
  Database: <Database className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Plug: <Plug className="h-4 w-4" />,
  FileOutput: <FileOutput className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
}

interface SkillCardProps {
  skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
  const cat = skillCategories[skill.category]

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
          {skill.verified && (
            <BadgeCheck className="h-4 w-4 text-primary" />
          )}
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
            v{skill.version}
          </span>
          <PriceTag price={skill?.price ?? 0} />
        </div>
      </div>

      <h3 className="mb-1.5 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {skill.name}
      </h3>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {skill.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {skill.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          >
            <Tag className="h-2.5 w-2.5" />
            {tag}
          </span>
        ))}
        {skill.tags.length > 3 && (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            +{skill.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          {skill.authorInfo.avatar ? (
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
              {skill.authorInfo.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{skill.authorInfo.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {skill.githubStats && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-amber-400" />
              {skill.githubStats.stars >= 1000
                ? (skill.githubStats.stars / 1000).toFixed(1) + "k"
                : skill.githubStats.stars}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            详情
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
