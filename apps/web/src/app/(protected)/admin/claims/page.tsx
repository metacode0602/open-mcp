"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Input } from "@repo/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Badge } from "@repo/ui/components/ui/badge";
import { AdminTablePagination } from "@/components/admin/admin-table-pagination";
import { Claims } from "@repo/db/types";
import { getAssetUrl } from "@/lib/utils";

type AppType = "client" | "server" | "application" | "all";
type ClaimStatus = "pending" | "approved" | "rejected" | "all";

export default function AdminClaimsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus>("all");
  const [appTypeFilter, setAppTypeFilter] = useState<AppType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    data: searchResult,
    isLoading,
  } = trpc.claims.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    appType: appTypeFilter !== "all" ? appTypeFilter : undefined,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">待处理</Badge>;
      case "approved":
        return <Badge variant="default">已通过</Badge>;
      case "rejected":
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="所有权申请管理"
        description="管理应用的所有权申请"
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索应用名称或申请人..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ClaimStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="申请状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={appTypeFilter}
          onValueChange={(value) => setAppTypeFilter(value as AppType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="应用类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="client">客户端</SelectItem>
            <SelectItem value="server">服务端</SelectItem>
            <SelectItem value="application">应用程序</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>应用</TableHead>
              <TableHead>申请人</TableHead>
              <TableHead>证明类型</TableHead>
              <TableHead>应用类型</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  加载中...
                </TableCell>
              </TableRow>
            ) : searchResult?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              searchResult?.data?.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {claim.appIcon && (
                        <img
                          src={getAssetUrl(claim.appIcon)}
                          alt={claim.appName}
                          className="h-8 w-8 rounded-lg"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{claim.appName}</span>
                        <span className="text-xs text-muted-foreground">
                          {claim.appId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{claim.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {claim.userEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{claim.proofType}</TableCell>
                  <TableCell>{claim.appType}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/claims/${claim.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        查看
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
  );
}

