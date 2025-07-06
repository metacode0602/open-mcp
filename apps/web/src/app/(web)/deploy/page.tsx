"use client"

import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"

export default function DeployPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const appSlug = searchParams.get("app")

  const { data: app } = trpc.mcpApps.getBySlug.useQuery({ slug: appSlug ?? "" })

  const [deploymentName, setDeploymentName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [advancedConfig, setAdvancedConfig] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStep, setDeploymentStep] = useState(0)
  const [deploymentComplete, setDeploymentComplete] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")

  const handleDeploy = async () => {
    if (!deploymentName) {
      toast.warning("部署名称不能为空", {
        description: "请输入一个有效的部署名称",
      })
      return
    }

    if (!apiKey) {
      toast.error("API 密钥不能为空", {
        description: "请输入有效的 API 密钥",
      })
      return
    }

    setIsDeploying(true)

    // 模拟部署过程
    await simulateDeployment()

    setDeploymentComplete(true)
    setDeploymentUrl(`https://${deploymentName.toLowerCase().replace(/\s+/g, "-")}.mcp-hub.example.com`)

    toast.success("部署成功", {
      description: "您的 MCP 服务已成功部署",
    })
  }

  const simulateDeployment = async () => {
    const steps = [
      "准备部署环境...",
      "验证 API 密钥...",
      "拉取应用镜像...",
      "配置服务参数...",
      "启动服务...",
      "配置网络和域名...",
      "完成部署",
    ]

    for (let i = 0; i < steps.length; i++) {
      setDeploymentStep(i)
      // 随机延迟 1-3 秒，模拟部署过程
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))
    }
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">部署 MCP 服务</h1>
          <p className="text-muted-foreground">{app ? `部署 ${app?.name} 到您的环境` : "部署 MCP 服务到您的环境"}</p>
        </div>

        {!deploymentComplete ? (
          <Card>
            <CardHeader>
              <CardTitle>部署配置</CardTitle>
              <CardDescription>配置您的 MCP 服务部署参数</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">基本配置</TabsTrigger>
                  <TabsTrigger value="advanced">高级配置</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="app">应用</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {app ? app.name : "自定义 MCP 服务"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">部署名称</Label>
                    <Input
                      id="name"
                      placeholder="my-mcp-server"
                      value={deploymentName}
                      onChange={(e) => setDeploymentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API 密钥</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="您的 API 密钥"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {app ? `您可以从 ${app.name} 控制台获取 API 密钥` : "输入您的 API 密钥以授权部署"}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="config">高级配置</Label>
                    <Textarea
                      id="config"
                      placeholder="# 在此处输入 YAML 或 JSON 配置"
                      className="min-h-[200px] font-mono"
                      value={advancedConfig}
                      onChange={(e) => setAdvancedConfig(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      高级配置允许您自定义部署参数，如资源限制、环境变量等
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? "部署中..." : "开始部署"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <CardTitle>部署成功</CardTitle>
                  <CardDescription>您的 MCP 服务已成功部署</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <div className="font-medium">部署信息</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">应用</span>
                    <span>{app ? app.name : "自定义 MCP 服务"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">部署名称</span>
                    <span>{deploymentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态</span>
                    <span className="text-green-600 dark:text-green-400">运行中</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL</span>
                    <span>{deploymentUrl}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <div className="font-medium">连接信息</div>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">使用以下信息连接到您的 MCP 服务：</p>
                  <pre className="bg-background p-2 rounded-md overflow-x-auto text-xs">
                    <code>
                      {`URL: ${deploymentUrl}\nAPI Key: ${apiKey.substring(0, 3)}${"*".repeat(apiKey.length - 6)}${apiKey.substring(apiKey.length - 3)}`}
                    </code>
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">返回首页</Link>
              </Button>
              <Button asChild>
                <Link href={deploymentUrl} target="_blank" rel="noopener noreferrer">
                  访问服务
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {isDeploying && !deploymentComplete && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>部署进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div
                        className={`h-4 w-4 rounded-full mr-2 ${i <= deploymentStep ? "bg-green-500" : "bg-muted"}`}
                      />
                      <span className={i <= deploymentStep ? "" : "text-muted-foreground"}>
                        {i === 0 && "准备部署环境..."}
                        {i === 1 && "验证 API 密钥..."}
                        {i === 2 && "拉取应用镜像..."}
                        {i === 3 && "配置服务参数..."}
                        {i === 4 && "启动服务..."}
                        {i === 5 && "配置网络和域名..."}
                        {i === 6 && "完成部署"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

