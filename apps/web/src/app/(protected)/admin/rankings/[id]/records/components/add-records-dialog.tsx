"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"

interface AddRecordsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rankingId: string
  onAdd?: (newRecords: any[]) => void
}

export function AddRecordsDialog({ open, onOpenChange, rankingId, onAdd }: AddRecordsDialogProps) {
  const utils = trpc.useUtils()
  const batchCreateMutation = trpc.rankingRecords.batchCreate.useMutation({
    onSuccess: () => utils.rankingRecords.getByRankingId.invalidate({ rankingId })
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 使用 trpc 的搜索查询
  const { data: searchResults, isLoading: isSearching } = trpc.apps.searchByRanking.useQuery(
    { query: searchTerm, rankingId },
    {
      enabled: searchTerm.length > 0,
      staleTime: 1000 * 60 * 5, // 5分钟缓存
    }
  )

  const handleSelectApp = (appId: string) => {
    setSelectedApps((prev) => {
      if (prev.includes(appId)) {
        return prev.filter((id) => id !== appId)
      } else {
        return [...prev, appId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedApps.length === 0) {
      toast.error("请选择应用", {
        description: "请至少选择一个应用添加到排行榜"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 创建新记录
      const newRecords = selectedApps.map((appId) => {
        const app = searchResults?.data?.find((app) => app.id === appId)
        return {
          rankingId,
          entityId: appId,
          entityName: app?.name || "未知应用",
          entityType: "apps",
          score: 0, // 初始分数为0
          rank: 0, // 初始排名为0
        }
      })
      await batchCreateMutation.mutateAsync(newRecords.map(record => ({
        ...record,
        entityType: "apps" as const // 将 entityType 显式指定为字面量类型 "apps"
      })))
      onAdd && onAdd(newRecords)
      toast.success("添加成功", {
        description: `已成功添加 ${newRecords.length} 条记录到排行榜`
      })

      // 重置状态
      setSearchTerm("")
      setSelectedApps([])
      onOpenChange(false)
    } catch (error) {
      toast.error("添加失败", {
        description: "添加记录时发生错误，请重试"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedApps.length === (searchResults ? searchResults.data.length : 0)) {
      setSelectedApps([])
    } else {
      setSelectedApps(searchResults ? searchResults.data.map((app) => app.id) : [])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>添加排行记录</DialogTitle>
            <DialogDescription>搜索并选择要添加到排行榜的应用。</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索应用名称..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">搜索中...</span>
              </div>
            ) : searchResults && searchResults.data.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>搜索结果 ({searchResults.data.length})</Label>
                  {searchResults.data.length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedApps.length === searchResults.data.length ? "取消全选" : "全选"}
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px] border rounded-md p-2">
                  <div className="space-y-2">
                    {searchResults.data.map((app) => (
                      <div key={app.id} className="flex items-start space-x-2 p-2 hover:bg-muted rounded-md">
                        <Checkbox
                          id={`app-${app.id}`}
                          checked={selectedApps.includes(app.id)}
                          onCheckedChange={() => handleSelectApp(app.id)}
                        />
                        <div className="grid gap-1">
                          <Label htmlFor={`app-${app.id}`} className="font-medium">
                            {app.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{app.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : searchTerm.length > 0 ? (
              <div className="text-center py-8 text-muted-foreground">未找到匹配的应用</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">请输入关键词搜索应用</div>
            )}

            {selectedApps.length > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">已选择 {selectedApps.length} 个应用</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || selectedApps.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  添加中...
                </>
              ) : (
                `添加 ${selectedApps.length > 0 ? selectedApps.length : ""} 条记录`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
