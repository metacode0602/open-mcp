"use client"

import { AdPromo } from "@/components/web/ad-promo"
import { trpc } from "@/lib/trpc/client"
import { notFound } from "next/navigation"
import { use } from "react"

export default function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // 获取广告数据
  const { data: ad, isLoading, error } = trpc.mcpAds.getById.useQuery({ id })

  // 增加展示次数的 mutation
  const incrementImpressions = trpc.mcpAds.incrementImpressions.useMutation()

  // 当广告数据加载完成后，增加展示次数
  useEffect(() => {
    if (ad && !incrementImpressions.isPending) {
      incrementImpressions.mutate({ id })
    }
  }, [ad, id, incrementImpressions])

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  // 处理错误状态
  if (error || !ad) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <AdPromo ad={ad} />
    </div>
  )
} 