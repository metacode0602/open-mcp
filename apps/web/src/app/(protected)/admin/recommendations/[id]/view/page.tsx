"use client"

import { use, useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { DataTable } from "@/components/admin/data-table"
import { useAppColumns } from "../../components/app-columns"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog"
import { ArrowLeft, Search } from "lucide-react"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface App {
  id: string;
  name: string;
}

export default function ViewRecommendationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingApp, setIsAddingApp] = useState(false)
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set()) // 修改为Set存储多个选中的ID
  const utils = trpc.useUtils();

  const { data: recommendation, isPending: isRecommendationPending, error: recommendationError } = trpc.recommendations.get.useQuery({ id })
  const { data: apps, isPending: isAppsPending, error: appsError } = trpc.recommendations.getAppsByRecommendationId.useQuery({ id })
  const { data: searchResults, isLoading: isSearching } = trpc.apps.searchByRecommendation.useQuery(
    { query: searchQuery, recommendationId: id, limit: 10 },
    { enabled: searchQuery.trim().length > 0 }
  )

  const { columns, setApps } = useAppColumns(id)

  const addApp = trpc.recommendations.addApp.useMutation({
    onSuccess: () => {
      toast.success("添加成功")
      utils.recommendations.getAppsByRecommendationId.invalidate({ id });
      setIsAddingApp(false)
      setSearchQuery("")
      setSelectedAppIds(new Set())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleAddApps = async () => {
    if (selectedAppIds.size === 0 || !recommendation) {
      toast.error("请至少选择一个应用")
      return
    }

    // 检查是否有重复应用
    const existingAppIds = new Set(apps?.map(app => app.appId) || [])
    const duplicateApps = Array.from(selectedAppIds).filter(id => existingAppIds.has(id))

    if (duplicateApps.length > 0) {
      toast.error("存在重复的应用，请重新选择")
      return
    }

    try {
      const baseOrder = (apps?.length ?? 0)
      // 一次性添加所有应用
      await addApp.mutateAsync({
        recommendationId: recommendation.id,
        appIds: Array.from(selectedAppIds),
        order: baseOrder
      })

      toast.success(`成功添加 ${selectedAppIds.size} 个应用`)
      setIsAddingApp(false)
      setSearchQuery("")
      setSelectedAppIds(new Set())
    } catch (error) {
      console.error(error)
      toast.error("添加应用时发生错误")
    }
  }

  if (isRecommendationPending || isAppsPending) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      </div>
    )
  }

  if (recommendationError || appsError) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>
            {recommendationError?.message || appsError?.message || "加载数据时发生错误"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!recommendation) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>推荐信息不存在</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">推荐详情</h2>
        <Button variant={"outline"} asChild><Link href="/admin/recommendations"><ArrowLeft className="size-4" />返回</Link></Button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium">基本信息</h3>
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">标题：</span>{recommendation?.title}</p>
              <p><span className="font-medium">类型：</span>{recommendation?.type}</p>
              <p><span className="font-medium">状态：</span>{recommendation?.status}</p>
              {recommendation?.description && (
                <p><span className="font-medium">描述：</span>{recommendation?.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">推荐应用</h3>
            <Dialog open={isAddingApp} onOpenChange={setIsAddingApp}>
              <DialogTrigger asChild>
                <Button>添加应用</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加应用</DialogTitle>
                  <DialogDescription>
                    搜索并选择要添加的应用（可多选）
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索应用..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {isSearching ? (
                    <div className="text-center">搜索中...</div>
                  ) : searchResults?.data?.length ? (
                    <div className="space-y-2">
                      {searchResults.data.map((app: App) => (
                        <div
                          key={app.id}
                          className={`p-2 rounded-md cursor-pointer ${selectedAppIds.has(app.id)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                            }`}
                          onClick={() => {
                            const newSelectedAppIds = new Set(selectedAppIds)
                            if (selectedAppIds.has(app.id)) {
                              newSelectedAppIds.delete(app.id)
                            } else {
                              newSelectedAppIds.add(app.id)
                            }
                            setSelectedAppIds(newSelectedAppIds)
                          }}
                        >
                          {app.name}
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="text-center">未找到相关应用</div>
                  ) : null}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingApp(false)
                      setSearchQuery("")
                      setSelectedAppIds(new Set())
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleAddApps}
                    disabled={selectedAppIds.size === 0}
                  >
                    添加 ({selectedAppIds.size} 个应用)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable
            data={apps ?? []}
            columns={columns}
          />
        </div>
      </div>
    </div>
  )
}