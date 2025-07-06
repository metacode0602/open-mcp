"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { formatDate } from "@/lib/utils";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";

interface AppOwnershipProps {
  appId: string;
  app: any;
}

export function AppOwnership({ appId, app }: AppOwnershipProps) {


  // 使用tRPC获取所有权认领请求
  const { data: claims, isLoading: isClaimsLoading, refetch: refetchClaims } = trpc.apps.getClaims.useQuery({ id: appId });
  const { data: ownerInfo, isLoading: isOwnerLoading } = trpc.apps.getOwner.useQuery({ id: app.ownerId });
  const { data: submissionInfo, isLoading: isSubmissionLoading } = trpc.apps.getSubmission.useQuery({ id: appId });

  // tRPC mutations
  const utils = trpc.useContext();

  const approveClaim = trpc.apps.approveClaim.useMutation({
    onSuccess: () => {
      toast.success("认领已批准", {
        description: "应用所有权已更新",
      });
      // 刷新数据
      refetchClaims();
      utils.apps.getById.invalidate({ id: appId });
    },
    onError: (error) => {
      toast.error("操作失败", {
        description: error.message,
      });
    },
  });

  const rejectClaim = trpc.apps.rejectClaim.useMutation({
    onSuccess: () => {
      toast.success("认领已拒绝", {
        description: "所有权认领请求已被拒绝",
      });
      // 刷新数据
      refetchClaims();
    },
    onError: (error) => {
      toast.error("操作失败", {
        description: error.message,
      });
    },
  });

  // 处理函数
  const handleClaimAction = (claimId: string, action: "approve" | "reject") => {
    if (action === "approve") {
      approveClaim.mutate({ claimId, appId });
    } else {
      rejectClaim.mutate({ claimId, appId });
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">已批准</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">待审核</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">已拒绝</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">所有者信息</CardTitle>
          <CardDescription>应用程序的当前所有者</CardDescription>
        </CardHeader>
        <CardContent>
          {isOwnerLoading ? (
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : ownerInfo ? (
            <div className="flex flex-col md:flex-row items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={ownerInfo.image || "/placeholder.svg"} alt={ownerInfo.name || ""} />
                <AvatarFallback>{ownerInfo.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">{app.ownerName || "未指定所有者"}</h3>
                  {app.verified && <Badge className="bg-blue-500">已验证</Badge>}
                </div>
                <p className="text-muted-foreground">{ownerInfo.email}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">拥有 {ownerInfo?.otherApps?.length + 1 || 1} 个应用</Badge>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">未找到所有者信息</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">提交信息</CardTitle>
          <CardDescription>应用程序的提交和审核信息</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmissionLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : submissionInfo && submissionInfo.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-md">
                <p className="text-sm text-muted-foreground">提交状态</p>
                <div className="mt-1">{getStatusBadge(submissionInfo[0]?.status || 'pending')}</div>
              </div>
              <div className="p-3 border rounded-md">
                <p className="text-sm text-muted-foreground">提交时间</p>
                <p className="font-medium">{formatDate(submissionInfo[0]?.createdAt)}</p>
              </div>
              <div className="p-3 border rounded-md">
                <p className="text-sm text-muted-foreground">批准时间</p>
                <p className="font-medium">{formatDate(submissionInfo[0]?.approvedAt)}</p>
              </div>
              <div className="p-3 border rounded-md">
                <p className="text-sm text-muted-foreground">审核人</p>
                <p className="font-medium">{submissionInfo[0]?.reviewedBy || '未指定'}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">未找到提交信息</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">所有权认领请求</CardTitle>
          <CardDescription>用户提交的应用所有权认领请求</CardDescription>
        </CardHeader>
        <CardContent>
          {isClaimsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : claims && claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="border rounded-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">由 {claim?.userName} 提交</h4>
                        <p className="text-sm text-muted-foreground">提交于 {formatDate(claim.createdAt)}</p>
                      </div>
                      <div>{getStatusBadge(claim.status)}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">认领者邮箱</p>
                        <p className="font-medium">{claim.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">证明类型</p>
                        <p className="font-medium capitalize">{claim.proofType}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-muted-foreground">证明链接</p>
                        <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                          {claim.proofUrl}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      {claim.additionalInfo && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">附加信息</p>
                          <p>{claim.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {claim.status === "pending" && (
                    <div className="bg-muted p-3 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleClaimAction(claim.id, "reject")} disabled={rejectClaim.isPending || approveClaim.isPending}>
                        <XCircle className="mr-2 h-4 w-4" />
                        拒绝
                      </Button>
                      <Button size="sm" onClick={() => handleClaimAction(claim.id, "approve")} disabled={rejectClaim.isPending || approveClaim.isPending}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        批准
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">暂无认领请求</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
