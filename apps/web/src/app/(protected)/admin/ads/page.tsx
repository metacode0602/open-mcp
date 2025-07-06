"use client"

import {
  ArrowUpDown,
  BarChart,
  Edit,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminTablePagination } from "@/components/admin/admin-table-pagination"
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
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/components/ui/card"
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
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"
import { AdsStatus, AdsType } from "@repo/db/types"
import { formatDate } from "@/lib/utils"

export default function AdminAdsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<AdsStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<AdsType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')

  // 使用 tRPC 查询广告数据
  const {
    data: searchResult,
    isLoading,
    error,
    refetch,
  } = trpc.ads.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  const ads = searchResult?.data || []

  // 使用 tRPC 更新广告状态
  const { mutate: updateAd } = trpc.ads.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("广告状态已更新", {
        description: "广告状态已成功更改",
      })
      refetch()
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      })
    },
  })

  // 处理状态更新
  const handleUpdateStatus = (adId: string, newStatus: AdsStatus) => {
    updateAd({
      id: adId,
      status: newStatus,
    })
  }

  // 添加排序处理函数
  const handleSort = (field: string) => {
    // 实现排序逻辑
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
  }

  // 添加状态徽章显示函数
  const getStatusBadge = (status: AdsStatus) => {
    const statusConfig = {
      active: { label: '活跃', variant: 'default' },
      pending: { label: '待审核', variant: 'warning' },
      paused: { label: '已暂停', variant: 'secondary' },
      rejected: { label: '已拒绝', variant: 'destructive' },
      completed: { label: '已完成', variant: 'outline' }
    }
    const config = statusConfig[status]
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  // 添加删除处理函数
  const handleDeleteAd = (id: string) => {
    // 实现删除逻辑
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
        title="广告管理"
        description="管理系统中的所有广告，包括横幅广告和列表广告。"
        actions={
          <Button asChild>
            <Link href="/admin/ads/create">
              <Plus className="mr-2 h-4 w-4" />
              创建广告
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索广告名称..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AdsStatus)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="paused">已暂停</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AdsType | "all")}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="banner">横幅广告</SelectItem>
                  <SelectItem value="listing">列表广告</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("title")}>
                    广告名称
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("startDate")}>
                    投放日期
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("price")}>
                    价格
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" className="p-0 font-medium" onClick={() => handleSort("impressions")}>
                    展示/点击
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7} className="h-16">
                      <div className="w-full h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : ads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BarChart className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">暂无广告</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="/admin/ads/create">创建新的广告</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{ad.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ad.type === "banner" ? "横幅广告" : "列表广告"}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(ad.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(ad.startDate)} 至 {formatDate(ad.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(ad.price)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col">
                        <span>{ad.impressions ? ad.impressions.toLocaleString() : 0} 次展示</span>
                        <span>
                          {ad.clicks ? ad.clicks.toLocaleString() : 0} 次点击 ({ad.ctr}%)
                        </span>
                      </div>
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
                            <Link href={`/admin/ads/${ad.id}`} className="cursor-pointer w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/ads/${ad.id}/edit`} className="cursor-pointer w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {ad.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ad.id, "paused")} className="cursor-pointer">
                              <Pause className="mr-2 h-4 w-4" />
                              暂停广告
                            </DropdownMenuItem>
                          ) : ad.status === "paused" || ad.status === "pending" ? (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(ad.id, "active")} className="cursor-pointer">
                              <Play className="mr-2 h-4 w-4" />
                              激活广告
                            </DropdownMenuItem>
                          ) : null}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除广告
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除广告？</AlertDialogTitle>
                                <AlertDialogDescription>此操作将删除广告 "{ad.title}"。删除后无法恢复。</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAd(ad.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  确认删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
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
        </CardFooter>
      </Card>
    </div>
  );
}

