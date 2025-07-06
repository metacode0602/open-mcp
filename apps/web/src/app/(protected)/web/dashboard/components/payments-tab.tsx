"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export function PaymentsTab() {
  const { data: payments, isLoading } = trpc.mcpDashboard.getPayments.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left py-3 px-4 font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b">
                  <td className="py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-5 w-16" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-3 px-4">
                    <Skeleton className="h-8 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">暂无支付记录</h3>
        <p className="text-muted-foreground mt-2">您还没有任何支付记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">支付记录</h3>
        <Button variant="outline" size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          申请发票
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium">订单号</th>
              <th className="text-left py-3 px-4 font-medium">类型</th>
              <th className="text-left py-3 px-4 font-medium">金额</th>
              <th className="text-left py-3 px-4 font-medium">支付方式</th>
              <th className="text-left py-3 px-4 font-medium">状态</th>
              <th className="text-left py-3 px-4 font-medium">日期</th>
              <th className="text-left py-3 px-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-muted/30">
                <td className="py-3 px-4">
                  {payment.invoiceNumber || `PAY-${payment.id}`}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline">
                    {payment.type === "ad"
                      ? "广告"
                      : payment.type === "subscription"
                      ? "订阅"
                      : "其他"}
                  </Badge>
                </td>
                <td className="py-3 px-4 font-medium">
                  ¥{payment.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {payment.method === "wechat"
                    ? "微信支付"
                    : payment.method === "alipay"
                    ? "支付宝"
                    : "银行转账"}
                </td>
                <td className="py-3 px-4">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td className="py-3 px-4 text-muted-foreground text-sm">
                  {payment.completedAt?.toLocaleDateString() || payment.createdAt.toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Button variant="ghost" size="sm">
                    查看详情
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 