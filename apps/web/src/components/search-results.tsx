"use client"

import { ArrowRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { trpc } from "@/lib/trpc/client"
import { McpApp } from "@repo/db/types"
import { getAssetUrl } from "@/lib/utils"
interface SearchResultsProps {
  query: string
  category: string
}

export function SearchResults({ query, category }: SearchResultsProps) {
  const { data: results, isLoading } = trpc.mcpSearch.searchApps.useQuery({ query, category })
  const [visibleCount, setVisibleCount] = useState(9)

  const loadMore = () => {
    setVisibleCount((prev) => prev + 9)
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden animate-pulse">
            <CardHeader className="p-4">
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-md bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="h-8 w-full bg-muted rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">没有找到相关结果</h3>
        <p className="text-muted-foreground mt-2">尝试使用不同的关键词或浏览分类</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results && results?.slice(0, visibleCount).map((app) => (
          <Card key={app.slug} className="flex flex-col overflow-hidden">
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
                      {app.stars && (
                        <div className="flex items-center ml-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 mr-0.5 text-yellow-400 fill-yellow-400" />
                          {app.stars}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
              <CardDescription className="line-clamp-4">{app.description}</CardDescription>
              <div className="flex flex-wrap gap-1 mt-3">
                {app.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
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
            <CardFooter className="p-4 pt-0">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/apps/${app.slug}`}>
                  查看详情
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {visibleCount < results.length && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={loadMore}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  )
}

