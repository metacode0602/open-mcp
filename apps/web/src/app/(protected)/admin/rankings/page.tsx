"use client"

import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Plus, Search, RefreshCw } from "lucide-react"
import { Input } from "@repo/ui/components/ui/input"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./components/columns"
import { trpc } from "@/lib/trpc/client"
import { CreateRankingDialog } from "./components/create-ranking-dialog"
import { Ranking } from "@repo/db/types"

export type RankingSource = "github" | "openmcp" | "producthunt"
export type RankingType = "daily" | "weekly" | "monthly" | "yearly"

export default function RankingsPage() {
  const [open, setOpen] = useState(false)

  const [searchParams, setSearchParams] = useState({
    query: "",
    source: "all" as "all" | RankingSource,
    type: "all" as "all" | RankingType,
    status: "all" as "all" | boolean,
    page: 1,
    limit: 10,
  })

  const { data, isLoading, refetch } = trpc.rankings.search.useQuery({
    query: searchParams.query,
    source: searchParams.source === "all" ? undefined : searchParams.source,
    page: searchParams.page,
    limit: searchParams.limit,
  })

  const rankings = (data?.data || []).map(item => ({
    ...item,
    recordsCount: item.recordsCount || 0,
  })) as Ranking[]

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }))
    refetch()
  }

  const handleReset = () => {
    setSearchParams({
      query: "",
      source: "all",
      type: "all",
      status: "all",
      page: 1,
      limit: 10,
    })
    refetch()
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">排行榜管理</h1>
          <p className="text-muted-foreground">管理来自 GitHub、OpenMCP 和 ProductHunt 的排行榜数据</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          创建排行榜
        </Button>
        <CreateRankingDialog open={open} onOpenChange={setOpen} />
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Input
          placeholder="搜索排行榜名称或描述"
          value={searchParams.query}
          onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          className="max-w-sm"
        />
        <Select
          value={searchParams.source}
          onValueChange={(value: "all" | RankingSource) =>
            setSearchParams(prev => ({ ...prev, source: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择来源" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
            <SelectItem value="openmcp">OpenMCP</SelectItem>
            <SelectItem value="producthunt">ProductHunt</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.type}
          onValueChange={(value: "all" | RankingType) =>
            setSearchParams(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="daily">每日</SelectItem>
            <SelectItem value="weekly">每周</SelectItem>
            <SelectItem value="monthly">每月</SelectItem>
            <SelectItem value="yearly">每年</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(searchParams.status)}
          onValueChange={(value) =>
            setSearchParams(prev => ({
              ...prev,
              status: value === "all" ? "all" : value === "true",
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="true">启用</SelectItem>
            <SelectItem value="false">禁用</SelectItem>
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
        data={rankings}
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

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="border rounded-lg">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
