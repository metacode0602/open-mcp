"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Separator } from "@repo/ui/components/ui/separator"
import {
  AlertCircle,
  Calendar,
  Code,
  FileText,
  GitFork,
  GitPullRequest,
  Github,
  Globe,
  Info,
  Languages,
  Layers,
  Server,
  Star,
  Tag,
  Users,
} from "lucide-react"

interface AppOverviewProps {
  app: any
}

export function AppOverview({ app: initialApp }: AppOverviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "未知"
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">已批准</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">待审核</Badge>
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">已拒绝</Badge>
      case "archived":
        return <Badge className="bg-gray-500 hover:bg-gray-600">已归档</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 顶部信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">名称</h4>
                  <p className="mt-1 font-medium">{initialApp.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Slug</h4>
                  <p className="mt-1">{initialApp.slug}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">类型</h4>
                  <p className="mt-1 capitalize">
                    {initialApp.type === "client" ? "客户端" : initialApp.type === "server" ? "服务器" : "应用程序"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">来源</h4>
                  <p className="mt-1 capitalize">
                    {initialApp.source === "automatic"
                      ? "自动"
                      : initialApp.source === "submitted"
                        ? "提交"
                        : initialApp.source === "admin"
                          ? "管理员"
                          : initialApp.source}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">状态</h4>
                  <div className="mt-1">{getStatusBadge(initialApp.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">精选状态</h4>
                  <p className="mt-1">{initialApp.featured ? "是" : "否"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">已验证</h4>
                  <p className="mt-1">{initialApp.verified ? "是" : "否"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">应用场景</h4>
                  <p className="mt-1 capitalize">{initialApp.scenario || "未指定"}</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">描述</h4>
                <p className="mt-1">{initialApp.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">详细描述</h4>
                <p className="mt-1">{initialApp.longDescription || "无详细描述"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5" />
              链接
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialApp.website && (
                <div className="flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
                  <a
                    href={initialApp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    官方网站
                  </a>
                </div>
              )}
              {initialApp.github && (
                <div className="flex items-center">
                  <Github className="mr-2 h-5 w-5 text-muted-foreground" />
                  <a
                    href={initialApp.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    GitHub 仓库
                  </a>
                </div>
              )}
              {initialApp.docs && (
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  <a
                    href={initialApp.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    文档
                  </a>
                </div>
              )}
              {!initialApp.website && !initialApp.github && !initialApp.docs && (
                <p className="text-muted-foreground">未提供链接</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息和技术栈 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Tag className="h-5 w-5" />
              详细信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">版本</h4>
                  <p className="mt-1">{initialApp.version || "未指定"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">许可证</h4>
                  <p className="mt-1">{initialApp.license || "未指定"}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">功能特点</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {initialApp.features?.length > 0 ? (
                    initialApp.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">未指定</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">支持的服务器</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {initialApp.supportedServers?.length > 0 ? (
                    initialApp.supportedServers.map((server: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {server}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">未指定</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Layers className="h-5 w-5" />
              工具和技术
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initialApp.tools ? (
              <div className="space-y-4">
                {Object.entries(initialApp.tools).map(([category, tools]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium capitalize flex items-center gap-1">
                      {category === "frontend" ? (
                        <Code className="h-4 w-4" />
                      ) : category === "backend" ? (
                        <Server className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      {category === "frontend"
                        ? "前端"
                        : category === "backend"
                          ? "后端"
                          : category === "database"
                            ? "数据库"
                            : category === "testing"
                              ? "测试"
                              : category === "payment"
                                ? "支付"
                                : category}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(tools) &&
                        tools.map((tool, index) => (
                          <Badge key={index} variant="outline">
                            {tool}
                          </Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">未指定工具和技术</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GitHub 统计 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Github className="h-5 w-5" />
            GitHub 统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                <span>星标</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.stars?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <GitFork className="mr-2 h-4 w-4" />
                <span>分支</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.forks?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>问题</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.issues?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <GitPullRequest className="mr-2 h-4 w-4" />
                <span>拉取请求</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.pullRequests?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>贡献者</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.contributors?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>关注者</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.watchers?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <GitFork className="mr-2 h-4 w-4" />
                <span>提交</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.commits?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center text-muted-foreground">
                <Star className="mr-2 h-4 w-4" />
                <span>发布</span>
              </div>
              <p className="font-medium text-lg mt-1">{initialApp.releases?.toLocaleString() || "0"}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Languages className="h-4 w-4" />
                  主要语言
                </h4>
                <p className="mt-1 font-medium">{initialApp.primaryLanguage || "未指定"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Code className="h-4 w-4" />
                  使用的语言
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {initialApp.languages?.length > 0 ? (
                    initialApp.languages.map((lang: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">未指定</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  最后提交
                </h4>
                <p className="mt-1">{formatDate(initialApp.lastCommit)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  最后分析时间
                </h4>
                <p className="mt-1">{formatDate(initialApp.lastAnalyzedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
