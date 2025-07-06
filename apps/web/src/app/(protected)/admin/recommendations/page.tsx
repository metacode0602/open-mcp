"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./components/columns"
import { trpc } from "@/lib/trpc/client"
import { Input } from "@repo/ui/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import { Button } from "@repo/ui/components/ui/button"
import { Search, RefreshCw, Plus } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

type RecommendationType = "rank" | "popular" | "new" | "related" | "category"

export default function RecommendationsPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    query: "",
    type: "all" as "all" | RecommendationType,
    status: "all" as "all" | "pending" | "active",
    page: 1,
    limit: 10,
  })

  const { data, isLoading, refetch } = trpc.recommendations.search.useQuery({
    query: searchParams.query,
    type: searchParams.type === "all" ? undefined : searchParams.type,
    page: searchParams.page,
    limit: searchParams.limit,
  })

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }))
    refetch()
  }

  const handleReset = () => {
    setSearchParams({
      query: "",
      type: "all",
      status: "all",
      page: 1,
      limit: 10,
    })
    refetch()
  }

  const handleCreate = () => {
    router.push("/admin/recommendations/create")
  }

  return (
    <div className="flex-1 space-y-4">
      <AdminPageHeader
        title="推荐管理"
        description="在平台上设置不同的推荐信息"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            创建推荐
          </Button>
        }
      />

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索标题"
          value={searchParams.query}
          onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          className="max-w-sm"
        />
        <Select
          value={searchParams.type}
          onValueChange={(value: "all" | RecommendationType) =>
            setSearchParams(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="rank">排行</SelectItem>
            <SelectItem value="popular">热门</SelectItem>
            <SelectItem value="new">最新</SelectItem>
            <SelectItem value="related">相关</SelectItem>
            <SelectItem value="category">分类</SelectItem>
            <SelectItem value="app">应用</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.status}
          onValueChange={(value: "all" | "pending" | "active") =>
            setSearchParams(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="active">已激活</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          重置
        </Button>
      </div>

      <DataTable
        // @ts-expect-error
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        pagination={{
          page: searchParams.page,
          limit: searchParams.limit,
          total: data?.pagination.total || 0,
          onPageChange: (page: number) => setSearchParams(prev => ({ ...prev, page })),
        }}
      />
    </div>
  )
} 