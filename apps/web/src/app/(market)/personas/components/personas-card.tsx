import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  BadgeCheck,
  Star,
} from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import type { UseCase } from "@/lib/types"
import { categories, difficultyLabels } from "@/lib/types"
import { PriceTag } from "../../components/price-tag"

const categoryIcons: Record<string, React.ReactNode> = {
  Users: <Users className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
}

interface UsecaseCardProps {
  usecase: UseCase
}

export function UsecaseCard({ usecase }: UsecaseCardProps) {
  const cat = categories[usecase.category]
  const diff = difficultyLabels[usecase.difficulty]

  return (
    <Link
      href={`/usecase/${usecase.id}`}
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
          {usecase.verified && (
            <BadgeCheck className="h-4 w-4 text-primary" />
          )}
          <span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span>
          <PriceTag price={usecase.price} />
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {usecase.title}
      </h3>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {usecase.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {usecase.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {usecase.tags.length > 3 && (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            +{usecase.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          {usecase.authorInfo.avatar ? (
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-secondary">
              <Image
                src={usecase.authorInfo.avatar}
                alt={usecase.authorInfo.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
              {usecase.authorInfo.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{usecase.authorInfo.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {usecase.githubStats && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-amber-400" />
              {usecase.githubStats.stars >= 1000
                ? (usecase.githubStats.stars / 1000).toFixed(1) + "k"
                : usecase.githubStats.stars}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            查看详情
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}
