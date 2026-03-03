"use client"

import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { use } from "react"

import { Button } from "@repo/ui/components/ui/button"

import { McpDetail, AppDetailSkeleton } from "../components/mcp-detail"
import { trpc } from "@/lib/trpc/client"

export default function McpSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: app, isLoading, error } = trpc.mcpApps.getBySlug.useQuery({ slug })

  if (isLoading) {
    return <AppDetailSkeleton />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <h2 className="mb-2 text-xl font-semibold">加载失败</h2>
        <p className="mb-6 text-muted-foreground">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">应用不存在</h2>
        <p className="mb-6 text-muted-foreground">找不到该应用，它可能已被删除或从未存在过。</p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  return <McpDetail app={app as Parameters<typeof McpDetail>[0]["app"]} />
}
