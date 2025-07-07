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

        <Section background="muted">
          <Container>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight">一键部署您的 MCP 服务</h2>
                  <p className="text-muted-foreground">
                    我们提供简单的自部署服务，让您可以快速部署和管理 MCP 服务器和应用
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <DeployButton />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-background p-4 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>部署控制台</span>
                      </div>
                      <div className="rounded-md bg-background p-2 font-mono text-xs">
                        <div className="text-green-500">&gt; 正在准备部署环境...</div>
                        <div className="text-green-500">&gt; 环境准备完成</div>
                        <div className="text-blue-500">&gt; 正在拉取 Neon MCP Server 镜像</div>
                        <div className="text-blue-500">&gt; 配置服务参数</div>
                        <div className="text-purple-500">&gt; 启动服务中...</div>
                        <div className="text-green-500">&gt; 部署成功！服务地址: mcp-server.example.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* <Section>
          <Container>
            <SectionHeader title="最新动态" description="了解 MCP 生态系统的最新发展和更新" />
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-lg border bg-background p-2 transition-all hover:shadow-md"
                >
                  <div className="flex h-[200px] flex-col justify-between rounded-md p-6">
                    <div className="space-y-2">
                      <h3 className="font-bold">MCP 协议更新 v1.2</h3>
                      <p className="text-sm text-muted-foreground">新版本增加了更多功能和改进的安全性</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">2025年3月15日</div>
                      <Button variant="outline" size="sm" className="w-full">
                        阅读更多
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section> */}
      </main>
    </div>
  )
}

