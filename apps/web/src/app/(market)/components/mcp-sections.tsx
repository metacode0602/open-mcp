"use client"

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { Button } from "@repo/ui/components/ui/button"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { AlertCircle, ArrowRight, RefreshCw, StarIcon, TagIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { formatDate, formatNumber, getAssetUrl } from "@/lib/utils"
import { trpc } from "@/lib/trpc/client"

const FEATURED_MCP_LIMIT = 6

type McpListApp = {
  id: string
  slug: string
  name: string
  icon: string | null
  description: string
  descriptionZh: string | null
  stars: number | null
  contributors: number | null
  primaryLanguage: string | null
  languages: string[] | null
  createdAt: Date
  tags: { id: string; name: string }[]
}

function McpServerCard({ app }: { app: McpListApp }) {
  const description = app.descriptionZh || app.description || ""
  const tags = app.tags?.slice(0, 3) ?? []
  const language = app.primaryLanguage ?? app.languages?.[0]

  return (
    <Link
      href={`/mcp/${app.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-accent/50"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            {app.icon ? (
              <Image
                src={getAssetUrl(app.icon) || "/placeholder.svg"}
                alt={app.name}
                width={40}
                height={40}
                className="object-cover h-full w-full"
              />
            ) : (
              <span className="text-lg font-bold text-primary">
                {app.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate transition-colors group-hover:text-primary">
              {app.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <StarIcon className="h-3 w-3" />
                {formatNumber(app.stars ?? 0)}
              </span>
              <span className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3" />
                {formatNumber(app.contributors ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mb-3 flex-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
          >
            <TagIcon className="h-2.5 w-2.5" />
            {tag.name}
          </span>
        ))}
        {app.tags.length > 3 && (
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            +{app.tags.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {language && (
            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {language}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(app.createdAt as string | Date)}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
          查看详情
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}

export function McpSections() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.marketplaceMcp.list.useQuery(
    {
      type: "server",
      limit: FEATURED_MCP_LIMIT,
    },
    {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30 * 1000,
    }
  )
  const apps = data?.items ?? []

  if (isLoading) {
    return (
      <section id="mcp-servers" className=" border-border py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  MCP 服务器
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                MCP 服务器
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                探索提供 MCP 服务的服务器应用，扩展 AI 助手能力。
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: FEATURED_MCP_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-[280px] sm:h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="mcp-servers" className=" border-border py-16">
        <div className="mx-auto max-w-7xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>
              获取 MCP 服务器列表时出现错误
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重试
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </section>
    )
  }

  return (
    <section id="mcp-servers" className=" border-border py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                MCP 服务器
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              MCP 服务器
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              探索提供 MCP 服务的服务器应用，扩展 AI 助手能力。
            </p>
          </div>
          <Link
            href="/category/server"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {apps.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <McpServerCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
            <p className="text-lg font-medium text-foreground">
              暂无 MCP 服务器
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              请稍后再查看或前往分类页浏览
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/category/server">查看全部</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
