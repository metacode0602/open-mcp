import type { McpApp } from "@repo/db/types"
import { cn } from "@repo/ui/lib/utils"

import { AppCard } from "@/components/web/app-card"

interface AppGridProps {
  apps: McpApp[]
  className?: string
  selectedTag?: string | null
  onTagClick?: (tag: string) => void
  emptyMessage?: {
    title: string
    description: string
  }
}

export function AppGrid({
  apps,
  className,
  selectedTag,
  onTagClick,
  emptyMessage = {
    title: "没有找到相关应用",
    description: "暂时没有此分类的应用，请稍后再查看",
  },
}: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <h3 className="text-lg font-medium">{emptyMessage.title}</h3>
        <p className="text-muted-foreground mt-2">{emptyMessage.description}</p>
      </div>
    )
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {apps.map((app, index) => (
        <AppCard key={`${app.id}-${index}`} app={app} selectedTag={selectedTag} onTagClick={onTagClick} />
      ))}
    </div>
  )
}

