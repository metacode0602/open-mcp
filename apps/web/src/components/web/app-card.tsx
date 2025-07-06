"use client"

import { Eye, GitFork, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@repo/ui/components/ui/hover-card"
import type { McpApp } from "@repo/db/types"
import { formatDate } from "@/lib/utils"
import { getAssetUrl } from "@/lib/utils"

interface AppCardProps {
  app: McpApp
  selectedTag?: string | null
  onTagClick?: (tag: string) => void
}

export function AppCard({ app, selectedTag, onTagClick }: AppCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md h-full py-2">
      <Link href={`/apps/${app.slug}`} className="flex flex-col flex-1">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
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
              <div>
                <CardTitle className="text-base">{app.name}</CardTitle>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={app.type === "client" ? "default" : app.type === "server" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {app.type === "client" ? "客户端" : app.type === "server" ? "服务器" : "应用"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-0">
          <HoverCard>
            <HoverCardTrigger asChild>
              <CardDescription className="line-clamp-2 cursor-pointer">{app.description}</CardDescription>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="text-sm text-muted-foreground">{app.description}</div>
            </HoverCardContent>
          </HoverCard>
          <div className="flex-wrap gap-1 mt-3">
            {app.tags?.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTag === tag.name ? "default" : "outline"}
                className="text-xs cursor-pointer"
                onClick={(e) => {
                  if (onTagClick) {
                    e.preventDefault()
                    e.stopPropagation()
                    onTagClick(tag.name)
                  }
                }}
              >
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
        <CardFooter className="mt-auto p-4 pt-0">
          <div className="flex items-center justify-between w-full space-x-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">{app.primaryLanguage}</Badge>
            </span>
            <span>{formatDate(app.createdAt)}</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}

