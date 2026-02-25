"use client"

import type { McpApp } from "@repo/db/types"
import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui/components/ui/hover-card"
import Image from "next/image"
import Link from "next/link"

import { formatDate, formatNumber } from "@/lib/utils"
import { getAssetUrl } from "@/lib/utils"
import { StarIcon, TagIcon, UsersIcon } from "lucide-react"

interface AppCardProps {
  app: McpApp
  selectedTag?: string | null
  onTagClick?: (tag: string) => void
}

export function AppCard({ app, selectedTag, onTagClick }: AppCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md h-full py-2">
      <Link href={`/apps/${app.slug}`} className="flex flex-col flex-1 min-h-0">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {app.icon ? (
                  <Image
                    src={getAssetUrl(app.icon) || "/placeholder.svg"}
                    alt={app.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="text-lg font-bold">{app.name.charAt(0)}</div>
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-base truncate">{app.name}</CardTitle>
                <div className="flex items-center mt-1 gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <StarIcon className="h-3 w-3" />
                    {formatNumber(app.stars || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UsersIcon className="h-3 w-3" />
                    {formatNumber(app.contributors || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-3 sm:p-4 pt-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <CardDescription className="line-clamp-2 cursor-pointer text-xs sm:text-sm">{app.descriptionZh || app.description}</CardDescription>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 max-w-[calc(100vw-2rem)]">
              <div className="text-sm text-muted-foreground">{app.descriptionZh || app.description}</div>
            </HoverCardContent>
          </HoverCard>
          <div className="flex flex-wrap gap-1 mt-3">
            {app.tags?.slice(0, 3).filter((tag) => tag && tag.name).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.name ? "default" : "secondary"}
                className="text-xs cursor-pointer touch-manipulation"
                onClick={(e) => {
                  if (onTagClick && tag.name) {
                    e.preventDefault()
                    e.stopPropagation()
                    onTagClick(tag.name)
                  }
                }}
              >
                <TagIcon className="mr-1 h-3 w-3" />
                {tag.name}
              </Badge>
            ))}
            {app.tags && app.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{app.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-auto p-3 sm:p-4 pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2 w-full text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">{app.primaryLanguage ?? app.languages?.[0]}</Badge>
            </span>
            <span>{formatDate(app.createdAt)}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

