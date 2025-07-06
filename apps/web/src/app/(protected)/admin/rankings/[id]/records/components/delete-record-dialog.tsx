"use client"

import { Button } from "@repo/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"

import { trpc } from "@/lib/trpc/client"

interface DeleteRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: any // 要删除的记录
}

export function DeleteRecordDialog({ open, onOpenChange, record }: DeleteRecordDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const utils = trpc.useUtils()

  const deleteMutation = trpc.rankingRecords.delete.useMutation({
    onSuccess: () => {
      // 刷新排行记录列表
      utils.rankingRecords.getByRankingId.invalidate({ rankingId: record.rankingId })
    },
  })

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteMutation.mutateAsync({
        id: record.id,
      })

      toast.success("排行记录删除成功")
      onOpenChange(false)
    } catch (error) {
      toast.error("删除失败", {
        description: error instanceof Error ? error.message : "删除排行记录时发生错误，请重试",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>删除排行记录</DialogTitle>
          <DialogDescription>
            您确定要删除这条排行记录吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 pb-6">
          <p className="text-muted-foreground">
            正在删除以下排行记录：
          </p>
          <p className="mt-2 font-medium">
            {record?.entityName || "未知实体"} (排名: {record?.rank || "N/A"})
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "删除中..." : "删除记录"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
