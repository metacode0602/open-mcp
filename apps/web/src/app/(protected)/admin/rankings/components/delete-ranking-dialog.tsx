"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog"
import { useState } from "react"
import { toast } from "sonner"

interface DeleteRankingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ranking: any
}

export function DeleteRankingDialog({ open, onOpenChange, ranking }: DeleteRankingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // 这里应该是实际的API调用
      // await deleteRanking(ranking.id);
      console.log("Deleting ranking:", ranking.id)

      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("排行榜删除成功", {
        description: `已成功删除排行榜 "${ranking.name}"`,
      })

      onOpenChange(false)
    } catch (error) {
      toast.error("删除失败", {
        description: "删除排行榜时发生错误，请重试",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除排行榜</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除排行榜 "{ranking?.name}" 吗？此操作不可撤销，相关的排行记录也将被删除。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "删除中..." : "删除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
