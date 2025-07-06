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
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils";

export default function ClaimDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: claim, isLoading, refetch } = trpc.claims.getById.useQuery({ id });
  const { mutate: updateClaimStatus } = trpc.claims.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleApprove = () => {
    updateClaimStatus({ id, status: "approved" });
  };

  const handleReject = () => {
    updateClaimStatus({ id, status: "rejected" });
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

  if (isLoading || !claim) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="所有权申请详情"
          description="查看和管理应用所有权申请"
          actions={
            <Button variant="outline" asChild>
              <Link href="/admin/claims">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <CardTitle>应用信息</CardTitle>
                  <CardDescription>申请的应用信息和状态</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">申请ID</p>
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">应用名称</p>
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">应用类型</p>
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">提交时间</p>
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">更新时间</p>
                <Skeleton className="h-5 w-40" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>申请人信息</CardTitle>
              <CardDescription>申请人的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">申请人ID</p>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">申请人姓名</p>
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">电子邮箱</p>
                <Skeleton className="h-5 w-48" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>证明材料</CardTitle>
              <CardDescription>申请人提供的所有权证明</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">证明类型</p>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">证明链接</p>
                <Skeleton className="h-5 w-48" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>审核信息</CardTitle>
              <CardDescription>申请的审核状态和记录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">审核时间</p>
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">审核人</p>
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">审核备注</p>
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="所有权申请详情"
        description="查看和管理应用所有权申请"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/claims">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            {claim.status === "pending" && (
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
                      <AlertDialogTitle>确认通过申请？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将通过应用 "{claim.appName}" 的所有权申请。
                        通过后，应用的所有权将转移给申请人。
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
                      <AlertDialogTitle>确认拒绝申请？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将拒绝应用 "{claim.appName}" 的所有权申请。
                        拒绝后，应用的所有权将保持不变。
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
            <div className="flex items-center gap-4">
              {claim.appIcon && (
                <img
                  src={getAssetUrl(claim.appIcon)}
                  alt={claim.appName}
                  className="h-12 w-12 rounded-lg"
                />
              )}
              <div>
                <CardTitle>应用信息</CardTitle>
                <CardDescription>申请的应用信息和状态</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">申请ID</p>
                <p className="text-sm text-muted-foreground">{claim.id}</p>
              </div>
              {getStatusBadge(claim.status)}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用名称</p>
              <p className="text-sm text-muted-foreground">{claim.appName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">应用类型</p>
              <p className="text-sm text-muted-foreground">{claim.appType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">提交时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(claim.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">更新时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(claim.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>申请人信息</CardTitle>
            <CardDescription>申请人的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">申请人ID</p>
              <p className="text-sm text-muted-foreground">
                {claim.userId}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">申请人姓名</p>
              <p className="text-sm text-muted-foreground">
                {claim.userName}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">电子邮箱</p>
              <p className="text-sm text-muted-foreground">
                {claim.userEmail}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>证明材料</CardTitle>
            <CardDescription>申请人提供的所有权证明</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">证明类型</p>
              <p className="text-sm text-muted-foreground">{claim.proofType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">证明链接</p>
              <a
                href={claim.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline"
              >
                查看证明材料
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>审核信息</CardTitle>
            <CardDescription>申请的审核状态和记录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.reviewedAt && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">审核时间</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(claim.reviewedAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">审核人</p>
                  <p className="text-sm text-muted-foreground">
                    {claim.reviewedBy}
                  </p>
                </div>
              </>
            )}
            {claim.status === "rejected" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">拒绝原因</p>
                <p className="text-sm text-muted-foreground">
                  {claim.reviewNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
