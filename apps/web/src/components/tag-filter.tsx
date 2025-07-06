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
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium mr-2">标签过滤:</h3>
        {selectedTag && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSelectTag(null)}>
            清除过滤 <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags && tags.data && tags.data.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTag === tag.name ? "default" : "outline"}
            className="cursor-pointer hover:bg-muted transition-colors"
            onClick={() => onSelectTag(tag.name === selectedTag ? null : tag.name)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

