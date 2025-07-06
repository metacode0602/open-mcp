"use client";

import { Download, Filter, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTablePagination } from "@/components/admin/admin-table-pagination";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Button } from "@repo/ui/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@repo/ui/components/ui/dropdown-menu";
import { Input } from "@repo/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { PaymentStatus, PaymentType } from "@repo/db/types";
export default function AdminPaymentsPage() {

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PaymentType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    data: searchResult,
    isLoading,
    error,
  } = trpc.payments.search.useQuery({
    query: searchQuery,
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter !== "all" ? statusFilter as PaymentStatus : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const { mutate: updatePayment } = trpc.payments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("支付状态已更新", {
        description: "支付记录已成功更新。",
      });
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      });
    },
  });

  // 获取支付方式文本
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "wechat":
        return "微信支付";
      case "alipay":
        return "支付宝";
      case "bank_transfer":
        return "银行转账";
      default:
        return method;
    }
  };

  // 获取支付类型文本
  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case "ad":
        return "广告";
      case "subscription":
        return "订阅";
      case "service":
        return "服务";
      default:
        return "其他";
    }
  };

  // 处理状态更新
  const handleStatusUpdate = (id: string, status: PaymentStatus) => {
    updatePayment({
      id,
      status,
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">加载失败</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="支付管理"
        description="管理平台上的所有支付记录"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出数据
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
            <Input id="search" type="search" placeholder="搜索用户或发票号..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="w-full md:w-[180px] space-y-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            状态
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus)}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">处理中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="refunded">已退款</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[180px] space-y-2">
          <label htmlFor="type-filter" className="text-sm font-medium">
            类型
          </label>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | "ad" | "subscription" | "service" | "other")}>
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="ad">广告</SelectItem>
              <SelectItem value="subscription">订阅</SelectItem>
              <SelectItem value="service">服务</SelectItem>
              <SelectItem value="other">其他</SelectItem>
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
              <TableHead>订单号</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>日期</TableHead>
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
              searchResult.data.map(({ payment, user }) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/payments/${payment.id}`} className="hover:underline">
                      {payment.invoiceNumber || `PAY-${payment.id}`}
                    </Link>
                  </TableCell>
                  <TableCell>{getPaymentTypeText(payment.type)}</TableCell>
                  <TableCell>{user?.name}</TableCell>
                  <TableCell>¥{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{getPaymentMethodText(payment.method)}</TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>{payment.completedAt?.toLocaleDateString() || payment.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">操作菜单</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/payments/${payment.id}`}>查看详情</Link>
                        </DropdownMenuItem>
                        {payment.status === "pending" && (
                          <>
                            <DropdownMenuItem className="text-green-600 dark:text-green-400" onClick={() => handleStatusUpdate(payment.id, "completed")}>
                              标记为已完成
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={() => handleStatusUpdate(payment.id, "failed")}>
                              标记为失败
                            </DropdownMenuItem>
                          </>
                        )}
                        {payment.status === "completed" && <DropdownMenuItem onClick={() => handleStatusUpdate(payment.id, "refunded")}>处理退款</DropdownMenuItem>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>发送收据</DropdownMenuItem>
                        {payment.invoiceNumber ? <DropdownMenuItem>查看发票</DropdownMenuItem> : <DropdownMenuItem>生成发票</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  没有找到符合条件的支付记录
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
  );
}
