"use client"

import { MarkdownReadonly } from "@repo/ui/components/markdown/markdown-readonly"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Separator } from "@repo/ui/components/ui/separator"
import { AlertCircle, Code, History, RefreshCw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"

interface AppAnalysisProps {
  appId: string
}

// 优化：添加类型定义
interface AnalysisDetailProps {
  analysis: any
  onClose: () => void
}

// 优化：拆分出详情组件
function AnalysisDetail({ analysis, onClose }: AnalysisDetailProps) {
  if (!analysis) return null

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    return num.toLocaleString()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[90%] md:!max-w-[75%] lg:!max-w-[960px] max-h-[90vh] overflow-hidden scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5" />
            详细分析结果
          </DialogTitle>
          <DialogDescription className="mt-2">分析完成时间: {formatDate(analysis.startTime)}</DialogDescription>
        </DialogHeader>

        {analysis.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>分析出现错误</AlertTitle>
            <AlertDescription>{analysis.error}</AlertDescription>
          </Alert>
        )}

        <ScrollArea className="mt-4 h-full max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {analysis.analysisResult.banner && (
              <div className="w-full">
                <img
                  src={analysis.analysisResult.banner || "/placeholder.svg"}
                  alt="Repository banner"
                  className="w-full h-auto rounded-lg object-cover max-h-[200px]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">基本信息</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">版本</p>
                    <p className="font-medium">{analysis.analysisResult.version || "暂无"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">开源协议</p>
                    <p className="font-medium">{analysis.analysisResult.license || "暂无"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">主要语言</p>
                    <p className="font-medium">{analysis.analysisResult.primaryLanguage || "暂无"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">最后提交</p>
                    <p className="font-medium">
                      {analysis.analysisResult.lastCommitDate
                        ? formatDate(analysis.analysisResult.lastCommitDate)
                        : "暂无"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">最后分析时间</p>
                    <p className="font-medium">
                      {analysis.analysisResult.lastAnalyzedAt
                        ? formatDate(analysis.analysisResult.lastAnalyzedAt)
                        : "暂无"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">统计数据</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Stars</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.stars)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Forks</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.forks)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issues</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.issues)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pull Requests</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.pullRequests)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contributors</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.contributors)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Watchers</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.watchers)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commits</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.commits)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Releases</p>
                    <p className="font-medium">{formatNumber(analysis.analysisResult.releases)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {analysis.analysisResult.languages?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">使用的编程语言</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysisResult.languages.map((lang: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.features?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">功能特性</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.features.map((feature: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.tools?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">使用的工具和技术</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.tools.map((tool: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.analysisResult.readme && (
              <>
                <Separator />
                <div className="mt-6 p-4">
                  <h4 className="font-medium mb-3">README 内容</h4>
                  <MarkdownReadonly>{analysis.analysisResult.readme}</MarkdownReadonly>
                </div>
              </>

            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function AppAnalysis({ appId }: AppAnalysisProps) {
  // 使用更明确的状态管理
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 使用tRPC获取分析历史
  const {
    data: analysisHistory,
    isLoading,
    refetch,
  } = trpc.appAnalysisHistory.getListByAppId.useQuery(
    {
      appId,
      limit: 6,
    },
    {
      // 添加轮询以获取最新状态
      refetchInterval: isAnalyzing ? 5000 : false,
    },
  )

  // tRPC mutations
  const startAnalysis = trpc.appAnalysisHistory.startAnalysis.useMutation({
    onSuccess: () => {
      toast.success("分析完成", {
        description: "应用分析已完成，结果已添加到分析历史",
      })
      setIsAnalyzing(false)
      // 刷新分析历史
      refetch()
    },
    onError: (error) => {
      toast.error("分析失败", {
        description: error.message,
      })
      setIsAnalyzing(false)
    },
  })

  // 处理函数
  const handleStartAnalysis = () => {
    setIsAnalyzing(true)
    startAnalysis.mutate({ appId })
  }

  const handleViewDetail = (analysis: any) => {
    setSelectedAnalysis(analysis)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    // 延迟清除数据，以便有平滑的关闭动画
    setTimeout(() => setSelectedAnalysis(null), 300)
  }

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">已完成</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">进行中</Badge>
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">失败</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">分析历史</CardTitle>
            <CardDescription>应用程序的分析记录</CardDescription>
          </div>
          <Button size="sm" onClick={handleStartAnalysis} disabled={isAnalyzing || startAnalysis.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing || startAnalysis.isPending ? "animate-spin" : ""}`} />
            {isAnalyzing || startAnalysis.isPending ? "分析中..." : "重新分析"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isAnalyzing && (
          <Alert className="mb-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <AlertTitle>正在分析应用</AlertTitle>
            <AlertDescription>正在分析应用代码和结构，这可能需要几分钟时间。</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 w-full bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : analysisHistory && analysisHistory.length > 0 ? (
          <div className="space-y-6">
            {analysisHistory.map((analysis: any, index: number) => (
              <div key={analysis.id} className="relative">
                {index < analysisHistory.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <History className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          版本 <Badge variant="outline">{analysis.type}</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">分析于 {formatDate(analysis.startTime)}</p>
                      </div>
                      <div className="flex flex-row gap-4 items-center">
                        {getStatusBadge(analysis.status)}
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(analysis)}>
                          查看详细分析
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">提取的特征</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis?.features?.map((feature: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">提取的标签</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis?.tags?.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">提取的分类</h5>
                        <div className="flex flex-wrap gap-1">
                          {analysis?.categories?.map((category: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">检测到的工具</h5>
                        <div className="space-y-1">
                          {Object.entries(analysis?.tools || {}).map(([category, tools]) => (
                            <div key={category} className="text-xs">
                              <span className="font-medium capitalize">
                                {category === "frontend"
                                  ? "前端"
                                  : category === "backend"
                                    ? "后端"
                                    : category === "database"
                                      ? "数据库"
                                      : category}
                                :
                              </span>{" "}
                              {Array.isArray(tools) && tools.join(", ")}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Code className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">暂无分析历史</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleStartAnalysis}>
              分析应用
            </Button>
          </div>
        )}
      </CardContent>

      {selectedAnalysis && <AnalysisDetail analysis={selectedAnalysis} onClose={handleCloseDetail} />}
    </Card>
  )
}
