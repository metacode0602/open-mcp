"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { format,formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ArrowLeft, BarChart3, Edit, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { trpc } from "@/lib/trpc/client"

import { EditRankingDialog } from "../components/edit-ranking-dialog"

interface RankingDetailsProps {
  id: string
}

export function RankingDetails({ id }: RankingDetailsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: ranking, isPending, refetch } = trpc.rankings.getById.useQuery({ id })


  const handleRefresh = () => {
    refetch();
  }

  if (isPending) {
    return <div>加载中...</div>
  }

  if (!ranking) {
    return <div>未找到排行榜</div>
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "github":
        return "bg-black text-white hover:bg-black/80"
      case "openmcp":
        return "bg-blue-600 hover:bg-blue-700"
      case "producthunt":
        return "bg-orange-600 hover:bg-orange-700"
      default:
        return ""
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "daily":
        return "default"
      case "weekly":
        return "secondary"
      case "monthly":
        return "outline"
      case "yearly":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/rankings">
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{ranking.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className={getSourceBadgeColor(ranking.source)}>
              {ranking.source === "github" && "GitHub"}
              {ranking.source === "openmcp" && "OpenMCP"}
              {ranking.source === "producthunt" && "ProductHunt"}
            </Badge>
            <Badge variant={getTypeBadgeVariant(ranking.type)}>
              {ranking.type === "daily" && "每日"}
              {ranking.type === "weekly" && "每周"}
              {ranking.type === "monthly" && "每月"}
              {ranking.type === "yearly" && "每年"}
            </Badge>
            <Badge variant={ranking.status ? "default" : "destructive"}>{ranking.status ? "启用" : "禁用"}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4" />
            编辑
          </Button>
          <Button className="gap-2" onClick={handleRefresh} disabled={isPending}>
            <RefreshCw className="h-4 w-4" />
            刷新数据
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>周期标识</CardDescription>
                <CardTitle className="text-2xl">{ranking.periodKey}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {ranking.type === "daily" && "日期格式: YYYYMMDD"}
                  {ranking.type === "weekly" && "周格式: YYYYWww"}
                  {ranking.type === "monthly" && "月份格式: YYYYMM"}
                  {ranking.type === "yearly" && "年份格式: YYYY"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>记录数量</CardDescription>
                <CardTitle className="text-2xl">{ranking.recordsCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" asChild className="gap-1 px-0">
                    <Link href={`/admin/rankings/${id}/records`}>
                      <BarChart3 className="h-4 w-4" />
                      查看所有记录
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>最后更新</CardDescription>
                <CardTitle className="text-2xl">
                  {ranking.updatedAt ? formatDistanceToNow(ranking.updatedAt, {
                    addSuffix: true,
                    locale: zhCN,
                  }) : "未更新"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{ranking.updatedAt ? format(ranking.updatedAt, "yyyy-MM-dd HH:mm:ss") : "未更新"}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>排行榜详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">描述</h4>
                  <p className="text-sm text-muted-foreground">{ranking.description || "无描述"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">创建时间</h4>
                  <p className="text-sm text-muted-foreground">{format(ranking.createdAt, "yyyy-MM-dd HH:mm:ss")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">更新时间</h4>
                  <p className="text-sm text-muted-foreground">{ranking.updatedAt ? format(ranking.updatedAt, "yyyy-MM-dd HH:mm:ss") : "未更新"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>排行榜设置</CardTitle>
              <CardDescription>管理排行榜的高级设置和配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">此功能正在开发中，敬请期待...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {ranking && (
        <EditRankingDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          ranking={ranking}
          onSuccess={() => {
            setIsEditOpen(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}
