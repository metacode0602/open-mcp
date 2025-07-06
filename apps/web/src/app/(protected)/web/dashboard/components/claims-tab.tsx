"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ArrowRight, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { DetailDialog } from "@/components/detail-dialog";
import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils";

export function ClaimsTab() {
  const { data: claims, isLoading } = trpc.mcpDashboard.getClaims.useQuery();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const { data: selectedClaim } = trpc.mcpClaims.getById.useQuery(
    { id: selectedClaimId! },
    { enabled: !!selectedClaimId }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div>
                    <Skeleton className="h-6 w-48" />
                    <div className="flex items-center gap-2 mt-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">您还没有提交任何所有权申请</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          如果您是应用的所有者或官方代表，可以申请应用的所有权
        </p>
        <Button variant="outline" asChild>
          <Link href="/category">
            <Shield className="mr-2 h-4 w-4" />
            浏览应用
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims && claims.map((claim) => (
        <Card key={claim.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {claim.appIcon ? (
                    <Image
                      src={getAssetUrl(claim.appIcon) || "/placeholder.svg"}
                      alt={claim.appName}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-lg font-bold">
                      {claim.appName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle>{claim.appName}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="mr-1">
                      {claim.appType === "client"
                        ? "客户端"
                        : claim.appType === "server"
                          ? "服务器"
                          : "应用"}
                    </Badge>
                    申请于 {claim.createdAt.toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                {claim.status === "approved" ? "已批准" : "审核中"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">所有权申请</span>
              {claim.status === "approved" && claim.updatedAt && (
                <span className="text-muted-foreground">
                  • 批准于 {claim.updatedAt.toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedClaimId(claim.id)}
            >
              查看详情
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/apps/${claim.appSlug}`}>
                查看应用
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}

      <DetailDialog
        title="所有权申请详情"
        isOpen={!!selectedClaimId}
        onOpenChange={(open) => !open && setSelectedClaimId(null)}
      >
        {selectedClaim && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  {selectedClaim.appIcon ? (
                    <Image
                      src={getAssetUrl(selectedClaim.appIcon) || "/placeholder.svg"}
                      alt={selectedClaim.appName}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-bold">
                      {selectedClaim.appName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedClaim.appName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {selectedClaim.appType === "client"
                        ? "客户端"
                        : selectedClaim.appType === "server"
                          ? "服务器"
                          : "应用"}
                    </Badge>
                    <span>提交于 {selectedClaim.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 申请状态 */}
            <div className="space-y-3 rounded-lg border p-4 bg-muted/10">
              <h4 className="font-medium">申请状态</h4>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    selectedClaim.status === "approved"
                      ? "default"
                      : selectedClaim.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {selectedClaim.status === "approved"
                    ? "已批准"
                    : selectedClaim.status === "rejected"
                      ? "已拒绝"
                      : "审核中"}
                </Badge>
                {selectedClaim.status !== "pending" && selectedClaim.updatedAt && (
                  <span className="text-sm text-muted-foreground">
                    更新于 {selectedClaim.updatedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* 申请内容 */}
            <div className="space-y-4">
              <h4 className="font-medium">申请信息</h4>
              <div className="space-y-3">
                {selectedClaim.title && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">标题</div>
                    <div className="mt-1">{selectedClaim.title}</div>
                  </div>
                )}
                {selectedClaim.reason && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">申请理由</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{selectedClaim.reason}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">证明类型</div>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {selectedClaim.proofType === "github"
                        ? "GitHub 账号"
                        : selectedClaim.proofType === "website"
                          ? "网站所有权"
                          : selectedClaim.proofType === "email"
                            ? "邮箱验证"
                            : "其他证明"}
                    </Badge>
                  </div>
                </div>
                {selectedClaim.additionalInfo && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">补充信息</div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{selectedClaim.additionalInfo}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 审核信息 */}
            {(selectedClaim.reviewNotes || selectedClaim.reviewedBy || selectedClaim.reviewedAt) && (
              <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
                <h4 className="font-medium">审核信息</h4>
                <div className="space-y-3">
                  {selectedClaim.reviewNotes && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">审核备注</div>
                      <div className="mt-1 text-sm whitespace-pre-wrap">{selectedClaim.reviewNotes}</div>
                    </div>
                  )}
                  {(selectedClaim.reviewedBy || selectedClaim.reviewedAt) && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {selectedClaim.reviewedBy && <span>审核人：{selectedClaim.reviewedBy}</span>}
                      {selectedClaim.reviewedAt && <span>审核时间：{selectedClaim.reviewedAt.toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDialog>
    </div>
  );
}