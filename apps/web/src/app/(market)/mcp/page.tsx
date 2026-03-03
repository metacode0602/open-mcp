"use client"

import { CategorySection } from "@/components/category-section"
import { HeroSection } from "@/components/hero-section"
import { Container } from "@/components/web/container"
import { Section } from "@/components/web/section"
import { trpc } from "@/lib/trpc/client"
import { AdPromo } from "@/components/web/ad-promo"
import { DeployButton } from "@/components/deploy-button"
import { Ads } from "@repo/db/types"

export default function Home() {
  // 获取广告列表
  const { data: adsList = [], isLoading: adsLoading } = trpc.mcpApps.getAdsListByType.useQuery({ adType: "banner" })

  // 根据广告位置分组
  const topAds = adsList.filter((ad: Ads) => ad.placement === "top")
  const middleAds = adsList.filter((ad: Ads) => ad.placement === "middle")
  const bottomAds = adsList.filter((ad: Ads) => ad.placement === "bottom")

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />

        {/* 顶部广告 */}
        {!adsLoading && topAds && topAds.map((ad: Ads) => (
          <AdPromo key={ad.id} ad={ad} />
        ))}

        {/* OpenMCP Studio 推广部分 */}
        {/* <OpenMCPStudioPromo /> */}

        {/* 客户端部分 */}
        <Section>
          <CategorySection category={"client"} limit={6} />
        </Section>

        {/* 中间广告 */}
        {!adsLoading && middleAds.map((ad: Ads) => (
          <AdPromo key={ad.id} ad={ad} />
        ))}

        {/* 服务器部分 */}
        <Section background="muted">
          <CategorySection category={"server"} limit={6} />
        </Section>

        {/* 应用部分 */}
        <Section>
          <CategorySection category={"application"} limit={6} />
        </Section>

        {/* 底部广告 */}
        {!adsLoading && bottomAds.map((ad: Ads) => (
          <AdPromo key={ad.id} ad={ad} />
        ))}
      </main>
    </div>
  )
}

