"use client"

import { UserRole } from "@repo/db/types"
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
import { Skeleton } from "@repo/ui/components/ui/skeleton"
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
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  User,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
import { trpc } from "@/lib/trpc/client"

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all")

  // 使用 tRPC 查询用户数据
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = trpc.users.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
    role: roleFilter === "all" ? undefined : roleFilter,
  })

  // 使用 tRPC 删除用户
  const { mutate: deleteUser } = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("用户已删除", {
        description: "用户已成功删除",
      })
      refetch()
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: error.message,
      })
    },
  })

  // 处理删除用户
  const handleDeleteUser = (userId: string) => {
    deleteUser({ id: userId })
  }

  // 获取角色标签
  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">管理员</Badge>
      case "member":
        return <Badge variant="secondary">会员</Badge>
      case "user":
        return <Badge variant="outline">用户</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  // 添加骨架屏组件
  const UserTableSkeleton = () => (
    <TableBody>
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

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
        title="用户管理"
        description="管理平台上的所有用户"
        actions={
          <Button asChild>
            <Link href="/admin/users/create">
              <Plus className="mr-2 h-4 w-4" />
              添加用户
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            搜索
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="search" type="search" placeholder="搜索用户名或邮箱..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="w-full md:w-[200px] space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            角色
          </label>
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
            <SelectTrigger id="role">
              <SelectValue placeholder="选择角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
              <SelectItem value="moderator">版主</SelectItem>
              <SelectItem value="user">用户</SelectItem>
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
              <TableHead>用户</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          {isLoading ? (
            <UserTableSkeleton />
          ) : searchResult?.data.length ? (
            <TableBody>
              {searchResult.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.image ? <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full" /> : <User className="h-8 w-8 text-muted-foreground" />}
                      <div>
                        <Link href={`/admin/users/${user.id}`} className="hover:underline">
                          {user.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{user.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {getRoleBadge(user.role)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user?.banned === true ? "default" : "secondary"}>{user?.banned === true ? "活跃" : "禁用"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
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
                          <Link href={`/admin/users/${user.id}`}>查看详情</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>编辑</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                              删除用户
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
                              <AlertDialogDescription>此操作将删除用户 "{user.name}"。 删除后无法恢复，且会影响该用户的所有数据。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                确认删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  没有找到符合条件的用户
                </TableCell>
              </TableRow>
            </TableBody>
          )}
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
  );
}

