"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { ArrowRight, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Container } from "@/components/web/container"
import { Section } from "@/components/web/section"
import { formatNumber } from "@/lib/utils"

type AdPromoProps = {
  ad: {
    id: string
    title: string
    description: string
    url: string
    imageUrl?: string | null
    type: "listing" | "banner"
    placement: "top" | "middle" | "bottom"
    version?: string | null
    impressions?: number | null
    clicks?: number | null
    app?: {
      type: "client" | "server" | "application"
    } | null
  }
  className?: string
}

const AdPromo = ({ ad, className }: AdPromoProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <AdPromoSkeleton />
  }

  const appType = ad.app?.type || ad.type

  if (appType === "client") {
    return <ClientAdPromo ad={ad} className={className} />
  }

  if (appType === "server") {
    return <ServerAdPromo ad={ad} className={className} />
  }

  return <ApplicationAdPromo ad={ad} className={className} />
}

const ClientAdPromo = ({ ad, className }: AdPromoProps) => {
  return (
    <Section background="primary" className={className}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">{ad.title}</h2>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">{ad.description}</p>
              <div className="flex flex-wrap gap-2 my-3">
                <Badge>跨平台支持</Badge>
                <Badge>多模型集成</Badge>
                <Badge>数据库连接</Badge>
                <Badge>开源免费</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
              <Button size="lg" className="gap-1" asChild>
                <Link href={ad.url}>
                  <Download className="h-4 w-4 mr-2" />
                  立即下载
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={ad.url}>
                  了解更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={ad.imageUrl || "/placeholder.svg"}
                    alt={ad.title}
                    width={640}
                    height={400}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">直观的用户界面</h3>
                      <p className="text-sm text-white/80">简洁而强大的界面设计，让您专注于与AI的交互</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{ad.version || "v1.0"}</div>
                    <div className="text-xs text-muted-foreground">最新版本</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.impressions || 0)}+</div>
                    <div className="text-xs text-muted-foreground">展示次数</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.clicks || 0)}+</div>
                    <div className="text-xs text-muted-foreground">点击次数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}

const ServerAdPromo = ({ ad, className }: AdPromoProps) => {
  return (
    <Section background="gradient" className={className}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">{ad.title}</h2>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">{ad.description}</p>
              <div className="flex flex-wrap gap-2 my-3">
                <Badge>高性能</Badge>
                <Badge>可扩展</Badge>
                <Badge>安全可靠</Badge>
                <Badge>易于部署</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
              <Button size="lg" className="gap-1" asChild>
                <Link href={ad.url}>
                  <Download className="h-4 w-4 mr-2" />
                  立即部署
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={ad.url}>
                  了解更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={ad.imageUrl || "/placeholder.svg"}
                    alt={ad.title}
                    width={640}
                    height={400}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">企业级解决方案</h3>
                      <p className="text-sm text-white/80">为您的业务提供强大的后端支持</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{ad.version || "v1.0"}</div>
                    <div className="text-xs text-muted-foreground">最新版本</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.impressions || 0)}+</div>
                    <div className="text-xs text-muted-foreground">展示次数</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.clicks || 0)}+</div>
                    <div className="text-xs text-muted-foreground">点击次数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}

const ApplicationAdPromo = ({ ad, className }: AdPromoProps) => {
  return (
    <Section background="muted" className={className}>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">{ad.title}</h2>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">{ad.description}</p>
              <div className="flex flex-wrap gap-2 my-3">
                <Badge>完整解决方案</Badge>
                <Badge>开箱即用</Badge>
                <Badge>持续更新</Badge>
                <Badge>技术支持</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
              <Button size="lg" className="gap-1" asChild>
                <Link href={ad.url}>
                  <Download className="h-4 w-4 mr-2" />
                  立即使用
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={ad.url}>
                  了解更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={ad.imageUrl || "/placeholder.svg"}
                    alt={ad.title}
                    width={640}
                    height={400}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">一站式解决方案</h3>
                      <p className="text-sm text-white/80">满足您的所有需求</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{ad.version || "v1.0"}</div>
                    <div className="text-xs text-muted-foreground">最新版本</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.impressions || 0)}+</div>
                    <div className="text-xs text-muted-foreground">展示次数</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">{formatNumber(ad.clicks || 0)}+</div>
                    <div className="text-xs text-muted-foreground">点击次数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}

const AdPromoSkeleton = () => {
  return (
    <Section>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-[400px] w-full max-w-md" />
          </div>
        </div>
      </Container>
    </Section>
  )
}

export { AdPromo, AdPromoSkeleton } 