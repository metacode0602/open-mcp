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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table"
import {
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
import { trpc } from "@/lib/trpc/client"

export default function AdminTagsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 使用 tRPC 查询标签数据
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = trpc.tags.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
  })

  // 使用 tRPC 删除标签
  const { mutate: deleteTag } = trpc.tags.delete.useMutation({
    onSuccess: () => {
      toast.success("标签已删除", {
        description: "标签已成功删除",
      })
      refetch()
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: error.message,
      })
    },
  })

  // 处理删除标签
  const handleDeleteTag = (tagId: string) => {
    deleteTag({ id: tagId })
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
        title="标签管理"
        description="管理应用标签"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/tags/create">
                <Plus className="mr-2 h-4 w-4" />
                添加标签
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索标签..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标签名称</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>应用数量</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={8} className="h-16">
                    <div className="w-full h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : searchResult?.data.length ? (
              searchResult.data.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/tags/${tag.id}`} className="hover:underline">
                        {tag.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">{tag.slug}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tag?.totalApps || 0}</Badge>
                  </TableCell>
                  <TableCell>{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(tag.updatedAt).toLocaleDateString()}</TableCell>
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
                          <Link href={`/admin/tags/${tag.id}`}>查看详情</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/tags/${tag.id}/edit`}>编辑</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                                删除标签
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除标签？</AlertDialogTitle>
                                <AlertDialogDescription>此操作将删除标签 "{tag.name}"。 删除后无法恢复，且会影响使用此标签的应用。</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTag(tag.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  确认删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <div className="text-center">
                    <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">没有找到标签</h3>
                    <p className="mt-1 text-sm text-muted-foreground">尝试调整搜索条件或创建一个新标签。</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {searchResult?.pagination && <AdminTablePagination currentPage={currentPage} totalPages={searchResult.pagination.totalPages} onPageChange={setCurrentPage} totalItems={0} itemsPerPage={0} showingFrom={0} showingTo={0} />}
    </div>
  );
}

