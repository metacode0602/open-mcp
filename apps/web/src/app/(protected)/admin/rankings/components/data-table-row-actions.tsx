"use client"

import { Row } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Button } from "@repo/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react"
import { useState } from "react"
import { EditRankingDialog } from "./edit-ranking-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@repo/ui/components/ui/alert-dialog"
import { trpc } from "@/lib/trpc/client"

interface Ranking {
  id: string
  [key: string]: any
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData & Ranking>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { mutate: deleteRanking } = trpc.rankings.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功", {
        description: "排行榜已成功删除",
      })
      utils.rankings.search.invalidate()
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: error.message,
      })
    },
  })
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => router.push(`/admin/rankings/${row.original.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            查看
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRankingDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        ranking={row.original}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除该排行榜及其所有相关数据，且无法恢复。是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRanking({ id: row.original.id })}
              className="bg-destructive hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}