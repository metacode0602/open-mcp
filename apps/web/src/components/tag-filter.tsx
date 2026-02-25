"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { X } from "lucide-react"

import { trpc } from "@/lib/trpc/client"

interface TagFilterProps {
  category: string
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export function TagFilter({ category, selectedTag, onSelectTag }: TagFilterProps) {
  const { data: tags } = trpc.mcpTags.list.useQuery({ query: category })

  if (!tags || tags.data.length === 0) {
    return null
  }

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="text-sm font-medium">标签过滤:</h3>
        {selectedTag && (
          <Button variant="ghost" size="sm" className="h-8 text-xs touch-manipulation" onClick={() => onSelectTag(null)}>
            清除过滤 <X className="ml-1 h-3 w-3 shrink-0" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags && tags.data && tags.data.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTag === tag.name ? "default" : "outline"}
            className="cursor-pointer hover:bg-muted transition-colors text-xs py-1.5 px-2.5 touch-manipulation"
            onClick={() => onSelectTag(tag.name === selectedTag ? null : tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

