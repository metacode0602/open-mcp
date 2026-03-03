"use client"

import { MarkdownReadonly } from "@repo/ui/components/markdown/markdown-readonly"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Separator } from "@repo/ui/components/ui/separator"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import {
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Eye,
  GitCommit,
  GitFork,
  Github,
  GitPullRequest,
  Info,
  Package,
  Star,
  Tag,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { ClaimAppDialog } from "@/components/claim-app-dialog"
import { RelatedApps } from "@/components/related-apps"
import { SuggestionDialog } from "@/components/suggestion-dialog"
import { AppGitHubCard } from "@/components/web/app-github-card"
import { AppVersionDialog } from "@/components/web/app-release-dialog"
import { formatDate, formatNumber, getAssetUrl } from "@/lib/utils"

export type McpDetailApp = {
  id: string
  slug: string
  name: string
  type: string
  description: string
  descriptionZh?: string | null
  longDescription?: string | null
  icon?: string | null
  website?: string | null
  github?: string | null
  repoId?: string | null
  version?: string | null
  repoCreatedAt?: Date | string | null
  updatedAt: Date | string
  license?: string | null
  stars?: number | null
  forks?: number | null
  watchers?: number | null
  issues?: number | null
  pullRequests?: number | null
  contributors?: number | null
  releases?: number | null
  lastCommit?: Date | string | null
  features?: string[] | null
  readme?: string | null
  readmeZh?: string | null
  supportedServers?: string[] | null
  tags?: Array<{ id: string; name: string } | null> | null
}

const AppDetailSkeleton = () => (
  <div className="mx-auto max-w-7xl px-6 py-10">
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  </div>
)

export function McpDetail({ app }: { app: McpDetailApp }) {
  const tagList = (app.tags ?? []).filter((t): t is { id: string; name: string } => t != null)
  const typeLabel = app.type === "client" ? "客户端" : app.type === "server" ? "服务器" : "应用"
  const backHref = app.type === "server" ? "/category/server" : app.type === "client" ? "/category/client" : "/"
  const backLabel = app.type === "server" ? "返回 MCP 服务器列表" : app.type === "client" ? "返回 MCP 客户端列表" : "返回列表"

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* 左侧主内容 */}
        <div className="min-w-0">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={backHref} className="transition-colors hover:text-foreground">
              {backLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">{app.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge variant={app.type === "client" ? "default" : app.type === "server" ? "secondary" : "outline"}>
                {typeLabel}
              </Badge>
              {tagList.slice(0, 5).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </span>
              ))}
            </div>

            <div className="mb-4 flex flex-col sm:flex-row items-start gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {app.icon ? (
                  <Image
                    src={getAssetUrl(app.icon)}
                    alt={app.name}
                    width={64}
                    height={64}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{app.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="mb-2 text-balance text-3xl font-bold text-foreground md:text-4xl">
                  {app.name}
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {app.descriptionZh || app.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {app.website && (
                <Button asChild variant="outline" size="sm">
                  <Link href={app.website} target="_blank" rel="noopener noreferrer">
                    访问官网
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {/* @ts-expect-error app shape from getBySlug */}
              <ClaimAppDialog app={app} />
              {/* @ts-expect-error app shape from getBySlug */}
              <SuggestionDialog app={app} />
            </div>
          </div>

          {/* 详细介绍 */}
          {app.longDescription && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                详细介绍
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownReadonly>{app.longDescription}</MarkdownReadonly>
                </div>
              </div>
            </section>
          )}

          {/* 功能特性 */}
          {app.features && app.features.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  {app.longDescription ? "2" : "1"}
                </span>
                功能特性
              </h2>
              <div className="rounded-xl border border-border bg-card p-6">
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                  {app.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* GitHub 项目卡片 */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {app.longDescription || app.features?.length ? "3" : "1"}
              </span>
              GitHub 项目
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              {/* @ts-expect-error app shape from getBySlug */}
              <AppGitHubCard project={app} />
            </div>
          </section>

          {/* 文档 Tabs */}
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {app.longDescription || app.features?.length ? "4" : "2"}
              </span>
              文档
            </h2>
            <Tabs defaultValue="readmeZh" className="rounded-xl border border-border bg-card">
              <TabsList className="w-full justify-start rounded-t-xl border-b border-border bg-muted/50 p-0">
                <TabsTrigger value="readmeZh" className="rounded-t-lg data-[state=active]:bg-background">
                  中文文档
                </TabsTrigger>
                <TabsTrigger value="readme" className="rounded-t-lg data-[state=active]:bg-background">
                  原文
                </TabsTrigger>
              </TabsList>
              <TabsContent value="readmeZh" className="m-0 p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownReadonly>{app.readmeZh ?? ""}</MarkdownReadonly>
                </div>
              </TabsContent>
              <TabsContent value="readme" className="m-0 p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownReadonly>{app.readme ?? ""}</MarkdownReadonly>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>

        {/* 右侧栏 */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* 应用信息 */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              应用信息
            </h3>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">类型</span>
                <span>{typeLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">最新版本</span>
                <span className="flex items-center gap-1">
                  {app.repoId ? (
                    <AppVersionDialog repoId={app.repoId} appName={app.name}>
                      <span className="flex items-center hover:text-primary transition-colors cursor-pointer">
                        {app.version || "N/A"}
                        <Info className="h-3.5 w-3.5 ml-1" />
                      </span>
                    </AppVersionDialog>
                  ) : (
                    <span>{app.version || "N/A"}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">创建日期</span>
                <span>{app.repoCreatedAt ? formatDate(app.repoCreatedAt as Date) : "未知"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">更新日期</span>
                <span>{formatDate(app.updatedAt as Date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">许可证</span>
                <span>{app.license || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* GitHub 统计 */}
          {app.github && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                GitHub 统计
              </h3>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Stars
                  </span>
                  <span className="font-medium">{formatNumber(app.stars ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GitFork className="h-4 w-4" />
                    Forks
                  </span>
                  <span className="font-medium">{formatNumber(app.forks ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Watchers
                  </span>
                  <span className="font-medium">{formatNumber(app.watchers ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Issues
                  </span>
                  <span className="font-medium">{formatNumber(app.issues ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GitPullRequest className="h-4 w-4" />
                    Pull Requests
                  </span>
                  <span className="font-medium">{formatNumber(app.pullRequests ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    贡献者
                  </span>
                  <span className="font-medium">{formatNumber(app.contributors ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    版本数
                  </span>
                  <span className="font-medium">{formatNumber(app.releases ?? 0) || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GitCommit className="h-4 w-4" />
                    最近提交
                  </span>
                  <span className="font-medium">
                    {app.lastCommit ? formatDate(app.lastCommit as Date) : "N/A"}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href={app.github} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  查看 GitHub
                </Link>
              </Button>
            </div>
          )}

          {/* 相关应用 */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              相关应用
            </h3>
            {/* @ts-expect-error app shape from getBySlug */}
            <RelatedApps currentApp={app} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export { AppDetailSkeleton }
