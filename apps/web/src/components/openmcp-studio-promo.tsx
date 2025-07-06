import { ArrowRight, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { Section } from "@/components/web/section"

export function OpenMCPStudioPromo() {
  return (
    <Section background="primary">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <LogoIcon type="studio" size="lg" />
              <h2 className="text-3xl font-bold tracking-tight">OpenMCP Studio</h2>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                我们的官方 MCP 客户端应用，为您提供强大的模型上下文协议支持，连接各种 MCP 服务器和工具。
              </p>
              <div className="flex flex-wrap gap-2 my-3">
                <Badge>跨平台支持</Badge>
                <Badge>多模型集成</Badge>
                <Badge>数据库连接</Badge>
                <Badge>开源免费</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                OpenMCP Studio 是一个功能强大的桌面应用，支持 Windows、macOS 和
                Linux，让您可以轻松使用自然语言与数据库、API 和其他工具交互。
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-2">
              <Button size="lg" className="gap-1" asChild>
                <Link href="/studio">
                  <Download className="h-4 w-4 mr-2" />
                  下载 OpenMCP Studio
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/studio/docs">
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
                    src="/placeholder.svg?height=400&width=640"
                    alt="OpenMCP Studio 界面预览"
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
                    <div className="text-2xl font-bold">v1.0</div>
                    <div className="text-xs text-muted-foreground">最新版本</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">10+</div>
                    <div className="text-xs text-muted-foreground">支持的服务器</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-bold">5k+</div>
                    <div className="text-xs text-muted-foreground">活跃用户</div>
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

