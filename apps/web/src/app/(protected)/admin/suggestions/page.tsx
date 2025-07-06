"use client"

import { SuggestionStatus, SuggestionType } from "@repo/db/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { Input } from "@repo/ui/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
import { trpc } from "@/lib/trpc/client"

export default function AdminSuggestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<SuggestionStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<SuggestionType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 使用 tRPC 查询建议数据
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = trpc.suggestions.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  // 使用 tRPC 更新建议状态
  const { mutate: updateSuggestion } = trpc.suggestions.update.useMutation({
    onSuccess: () => {
      toast.success("建议状态已更新", {
        description: "建议状态已成功更改",
      })
      refetch()
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      })
    },
  })

  // 获取建议状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle2 className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewing":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // 处理状态更新
  const handleUpdateStatus = (suggestionId: string, newStatus: string) => {
    updateSuggestion({
      id: suggestionId,
      status: newStatus as "pending" | "rejected" | "reviewing" | "accepted" | "implemented" | "duplicate",
    })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">加载失败</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="建议管理"
        description="管理平台上的所有建议"
      />

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            搜索
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="搜索建议标题或内容..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full md:w-[180px] space-y-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            状态
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SuggestionStatus | "all")}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="reviewing">审核中</SelectItem>
              <SelectItem value="accepted">已通过</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[180px] space-y-2">
          <label htmlFor="type-filter" className="text-sm font-medium">
            类型
          </label>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as SuggestionType | "all")}>
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="feature">功能建议</SelectItem>
              <SelectItem value="bug">问题反馈</SelectItem>
              <SelectItem value="improvement">改进建议</SelectItem>
              <SelectItem value="other">其他建议</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" className="flex-shrink-0">
          <Filter className="h-4 w-4" />
          <span className="sr-only">高级筛选</span>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>建议标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交者</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>处理时间</TableHead>
              <TableHead>优先级</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : searchResult?.data.length ? (
              searchResult.data.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/suggestions/${suggestion.id}`}
                      className="hover:underline"
                    >
                      {suggestion.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {suggestion.type === "feature"
                        ? "功能建议"
                        : suggestion.type === "bug"
                          ? "问题反馈"
                          : suggestion.type === "improvement"
                            ? "改进建议"
                            : "其他建议"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(suggestion.status)}
                      <Badge
                        variant={
                          suggestion.status === "accepted"
                            ? "default"
                            : suggestion.status === "reviewing"
                              ? "secondary"
                              : suggestion.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {suggestion.status === "accepted"
                          ? "已通过"
                          : suggestion.status === "reviewing"
                            ? "审核中"
                            : suggestion.status === "rejected"
                              ? "已拒绝"
                              : "待处理"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{suggestion.submitter?.name || "未知"}</TableCell>
                  <TableCell>{new Date(suggestion.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {suggestion.status === "accepted" || suggestion.status === "implemented"
                      ? new Date(suggestion.updatedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        suggestion.priority === "high"
                          ? "destructive"
                          : suggestion.priority === "medium"
                            ? "default"
                            : "outline"
                      }
                    >
                      {suggestion.priority === "high"
                        ? "高"
                        : suggestion.priority === "medium"
                          ? "中"
                          : "低"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">打开菜单</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/suggestions/${suggestion.id}`}>查看详情</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/suggestions/${suggestion.id}/edit`}>编辑</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {suggestion.status === "pending" && (
                          <>
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="w-full text-left" type="button">通过建议</button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认通过建议？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      此操作将通过建议 "{suggestion.title}"。
                                      通过后建议将标记为已处理。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(suggestion.id, "accepted")}
                                    >
                                      确认
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="w-full text-left" type="button">拒绝建议</button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认拒绝建议？</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      此操作将拒绝建议 "{suggestion.title}"。
                                      拒绝后建议将标记为已处理。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleUpdateStatus(suggestion.id, "rejected")}
                                    >
                                      确认
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  没有找到符合条件的建议
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {searchResult && (
        <AdminTablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(searchResult.pagination.total / itemsPerPage)}
          onPageChange={setCurrentPage}
          totalItems={searchResult.pagination.total}
          itemsPerPage={itemsPerPage}
          showingFrom={(currentPage - 1) * itemsPerPage + 1}
          showingTo={Math.min(currentPage * itemsPerPage, searchResult.pagination.total)}
        />
      )}
    </div>
  )
}

