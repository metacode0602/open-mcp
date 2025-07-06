"use client";

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
} from "@repo/ui/components/ui/alert-dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  DollarSign,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

// 模拟支付数据
const payment = {
  id: "1",
  orderId: "ORD-2025-0301-001",
  amount: 299.99,
  currency: "CNY",
  status: "pending",
  paymentMethod: "alipay",
  createdAt: "2025-03-01 10:30:00",
  updatedAt: "2025-03-01 10:35:00",
  customer: {
    id: "1",
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13800138000",
  },
  app: {
    id: "1",
    name: "示例应用",
    version: "1.0.0",
  },
  transaction: {
    id: "TXN-2025-0301-001",
    provider: "支付宝",
    providerTransactionId: "202503011030001",
    status: "success",
    paidAt: "2025-03-01 10:35:00",
  },
};

export default function PaymentDetailPage() {
  const params = useParams();
  const [status, setStatus] = useState(payment.status);

  const handleApprove = () => {
    setStatus("approved");
  };

  const handleReject = () => {
    setStatus("rejected");
  };

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "alipay":
        return "支付宝";
      case "wechat":
        return "微信支付";
      case "card":
        return "银行卡";
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="支付详情"
        description="查看和管理支付信息"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/payments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            {status === "pending" && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      通过
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认通过支付？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将通过订单 {payment.orderId} 的支付。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApprove}>
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      拒绝
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认拒绝支付？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将拒绝订单 {payment.orderId} 的支付。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReject}>
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>支付的基本信息和状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">订单号</p>
                <p className="text-sm text-muted-foreground">
                  {payment.orderId}
                </p>
              </div>
              {getStatusBadge(status)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">支付金额</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">
                  {payment.amount} {payment.currency}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">支付方式</p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">创建时间</p>
              <p className="text-sm text-muted-foreground">
                {payment.createdAt}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">更新时间</p>
              <p className="text-sm text-muted-foreground">
                {payment.updatedAt}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
            <CardDescription>支付客户的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">客户ID</p>
              <p className="text-sm text-muted-foreground">
                {payment.customer.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">客户姓名</p>
              <p className="text-sm text-muted-foreground">
                {payment.customer.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">电子邮箱</p>
              <p className="text-sm text-muted-foreground">
                {payment.customer.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">联系电话</p>
              <p className="text-sm text-muted-foreground">
                {payment.customer.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>应用信息</CardTitle>
            <CardDescription>相关应用的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">应用ID</p>
              <p className="text-sm text-muted-foreground">{payment.app.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用名称</p>
              <p className="text-sm text-muted-foreground">
                {payment.app.name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用版本</p>
              <p className="text-sm text-muted-foreground">
                {payment.app.version}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>交易信息</CardTitle>
            <CardDescription>支付交易的详细信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">交易ID</p>
              <p className="text-sm text-muted-foreground">
                {payment.transaction.id}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">支付提供商</p>
              <p className="text-sm text-muted-foreground">
                {payment.transaction.provider}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">提供商交易ID</p>
              <p className="text-sm text-muted-foreground">
                {payment.transaction.providerTransactionId}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">交易状态</p>
              {getStatusBadge(payment.transaction.status)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">支付时间</p>
              <p className="text-sm text-muted-foreground">
                {payment.transaction.paidAt}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
