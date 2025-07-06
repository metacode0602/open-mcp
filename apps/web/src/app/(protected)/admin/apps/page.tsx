"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { columns } from "./components/columns";
import { trpc } from "@/lib/trpc/client";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Button } from "@repo/ui/components/ui/button";
import { Search, RefreshCw, Plus } from "lucide-react";
import { AppStatus, AppType } from "@repo/db/types";
import { AddGitHubAppButton } from "@/components/admin/apps/add-github-app";

export default function AdminAppsPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    query: "",
    type: "all" as "all" | AppType,
    status: "all" as "all" | AppStatus,
    page: 1,
    limit: 10,
  });

  const { data, isLoading, refetch } = trpc.apps.search.useQuery({
    query: searchParams.query,
    type: searchParams.type === "all" ? undefined : searchParams.type,
    status: searchParams.status === "all" ? undefined : searchParams.status,
    page: searchParams.page,
    limit: searchParams.limit,
  });

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }));
    refetch();
  };

  const handleReset = () => {
    setSearchParams({
      query: "",
      type: "all",
      status: "all",
      page: 1,
      limit: 10,
    });
    refetch();
  };

  const handleCreate = () => {
    router.push("/admin/apps/create");
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">应用管理</h2>
        <div className="flex items-center space-x-4">
          <AddGitHubAppButton />
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            添加应用
          </Button>
        </div>

      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="搜索应用名称或描述"
          value={searchParams.query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
          className="max-w-sm"
        />
        <Select
          value={searchParams.type}
          onValueChange={(value: "all" | AppType) =>
            setSearchParams(prev => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="client">客户端应用</SelectItem>
            <SelectItem value="server">服务端应用</SelectItem>
            <SelectItem value="application">应用</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.status}
          onValueChange={(value: "all" | AppStatus) =>
            setSearchParams(prev => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
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
  );
}
