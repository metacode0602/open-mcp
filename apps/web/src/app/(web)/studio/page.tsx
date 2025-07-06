import { CheckCircle, Database, Download, Github, Laptop, Server } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { PageHeader } from "@/components/web/page-header"
import { Section } from "@/components/web/section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"

export default function StudioPage() {
  return (
    <Container className="py-10">
      <PageHeader title="OpenMCP Studio" backLink={{ href: "/", label: "返回首页" }} align="center">
        <div className="flex items-center gap-3 mb-4 justify-center">
          <LogoIcon type="studio" size="xl" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          功能强大的 MCP 客户端应用，让您轻松使用自然语言与数据库、API 和其他工具交互
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <Badge className="text-sm px-3 py-1">v1.0.0</Badge>
          <Badge className="text-sm px-3 py-1" variant="outline">
            开源免费
          </Badge>
          <Badge className="text-sm px-3 py-1" variant="outline">
            跨平台支持
          </Badge>
          <Badge className="text-sm px-3 py-1" variant="outline">
            多模型集成
          </Badge>
        </div>

        <div className="flex gap-4 mt-8 justify-center">
          <Button size="lg" asChild>
            <Link href="#download">
              <Download className="mr-2 h-5 w-5" />
              下载 OpenMCP Studio
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="https://github.com/openmcp/studio" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-5 w-5" />
              GitHub 仓库
            </Link>
          </Button>
        </div>
      </PageHeader>

      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <Image
                  src="/placeholder.svg?height=600&width=800"
                  alt="OpenMCP Studio 界面预览"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">强大的 MCP 客户端</h2>
            <p className="text-muted-foreground">
              OpenMCP Studio 是一个功能强大的桌面应用，支持 Windows、macOS 和
              Linux，让您可以轻松使用自然语言与数据库、API 和其他工具交互。
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">多服务器支持</h3>
                  <p className="text-sm text-muted-foreground">
                    连接到任何兼容 MCP 协议的服务器，包括 Neon、Upstash、Supabase 等
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">自然语言交互</h3>
                  <p className="text-sm text-muted-foreground">使用自然语言查询和管理数据库，无需编写复杂的 SQL 语句</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">多模型支持</h3>
                  <p className="text-sm text-muted-foreground">
                    支持多种 AI 模型，包括 GPT-4、Claude 等，根据需求选择最适合的模型
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">开源免费</h3>
                  <p className="text-sm text-muted-foreground">完全开源，社区驱动，永久免费使用</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="muted">
        <h2 className="text-3xl font-bold text-center mb-8">主要功能</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Laptop className="h-8 w-8 text-primary mb-2" />
              <CardTitle>直观的用户界面</CardTitle>
              <CardDescription>简洁而强大的界面设计，让您专注于与AI的交互</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 简洁的聊天界面</li>
                <li>• 深色/浅色主题</li>
                <li>• 会话历史管理</li>
                <li>• 代码高亮显示</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Server className="h-8 w-8 text-primary mb-2" />
              <CardTitle>服务器连接</CardTitle>
              <CardDescription>轻松连接到各种 MCP 服务器</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 多服务器管理</li>
                <li>• 自定义服务器配置</li>
                <li>• 连接状态监控</li>
                <li>• 安全的凭证管理</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>数据库操作</CardTitle>
              <CardDescription>使用自然语言管理您的数据库</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• SQL 查询生成</li>
                <li>• 数据可视化</li>
                <li>• 数据库结构分析</li>
                <li>• 数据导入/导出</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="download">
        <h2 className="text-3xl font-bold text-center mb-8">下载 OpenMCP Studio</h2>
        <Tabs defaultValue="windows" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="macos">macOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          <TabsContent value="windows" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Windows 版本</CardTitle>
                <CardDescription>支持 Windows 10 及以上版本</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">安装程序 (.exe) - 64位</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">便携版 (.zip) - 64位</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                SHA256 校验和: 3a7e5e2f8b9c1d6e4a2b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="macos" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>macOS 版本</CardTitle>
                <CardDescription>支持 macOS 11.0 及以上版本</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">Intel (.dmg)</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">Apple Silicon (.dmg)</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                SHA256 校验和: 4b8c9d0e1f2a3b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="linux" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Linux 版本</CardTitle>
                <CardDescription>支持主流 Linux 发行版</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">AppImage</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">Debian/Ubuntu (.deb)</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">OpenMCP Studio v1.0.0</div>
                    <div className="text-sm text-muted-foreground">Fedora/RHEL (.rpm)</div>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                SHA256 校验和: 5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section background="muted">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">加入我们的社区</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            OpenMCP Studio 是一个开源项目，我们欢迎您的贡献和反馈。加入我们的社区，一起打造更好的 MCP 客户端应用。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="https://github.com/openmcp/studio" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                GitHub
              </Link>
            </Button>
            <Button variant="outline">Discord 社区</Button>
            <Button variant="outline">问题反馈</Button>
            <Button variant="outline">开发文档</Button>
          </div>
        </div>
      </Section>
    </Container>
  )
}

