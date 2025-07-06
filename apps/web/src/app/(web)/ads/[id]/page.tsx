import { AdPromo } from "@/components/web/ad-promo"
import { serverApi } from "@/lib/trpc/server"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function AdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ad = await serverApi.mcpAds.getById.query({ id })

  if (!ad) {
    notFound()
  }

  // 增加展示次数
  await serverApi.mcpAds.incrementImpressions.mutate({ id })

  return (
    <div className="container mx-auto py-8">
      <AdPromo ad={ad} />
    </div>
  )
} 