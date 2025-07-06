"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@repo/ui/components/ui/alert-dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Calendar, Clock, Loader2, Power, Star } from "lucide-react";
import { useState } from "react";

import { AppAds } from "@/components/admin/apps/app-ads";
import { AppAnalysis } from "@/components/admin/apps/app-analysis";
import { AppMetadata } from "@/components/admin/apps/app-metadata";
// 导入各个标签页组件
import { AppOverview } from "@/components/admin/apps/app-overview";
import { AppOwnership } from "@/components/admin/apps/app-ownership";
import { AppRelated } from "@/components/admin/apps/app-related";
import { formatDate, getAssetUrl } from "@/lib/utils";
import Link from "next/link";

interface AppDetailsProps {
  appId: string;
}

export function AppDetails({ appId }: AppDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);


  // 使用tRPC获取应用详情
  const { data: app, isLoading, error } = trpc.apps.getById.useQuery({ id: appId });

  const utils = trpc.useUtils();
  const updatePublishStatus = trpc.apps.updatePublishStatus.useMutation({
    onSuccess: () => {
      utils.apps.getById.invalidate({ id: appId });
      toast.success("状态更新成功", {
        description: "应用发布状态已更新",
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      });
      setIsUpdating(false);
    },
  });

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    const newStatus = app?.publishStatus === "online" ? "offline" : "online";
    updatePublishStatus.mutate({ id: appId, status: newStatus });
    setIsConfirmOpen(false);
  };

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-md bg-muted animate-pulse" />
              <div>
                <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-full bg-muted animate-pulse rounded mb-4" />
            <div className="h-[400px] w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 处理错误状态
  if (error || !app) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">加载失败</CardTitle>
            <CardDescription>{error?.message || "无法加载应用详情，请稍后再试。"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // 辅助函数
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600">已批准</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">待审核</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">已拒绝</Badge>;
      case "archived":
        return <Badge className="bg-gray-500 hover:bg-gray-600">已归档</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "automatic":
        return <Badge variant="outline">自动</Badge>;
      case "submitted":
        return <Badge variant="outline">提交</Badge>;
      case "admin":
        return <Badge variant="outline">管理员</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getPublishStatusBadge = (status: string) => {
    if (status === "online") {
      return <Badge className="bg-green-500 hover:bg-green-600">已上线</Badge>;
    }
    return <Badge className="bg-gray-500 hover:bg-gray-600">已下线</Badge>;
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <img src={getAssetUrl(app.icon) || "/placeholder.svg"} alt={`${app.name} 图标`} className="h-20 w-20 rounded-md object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <CardTitle className="text-2xl">{app.name}</CardTitle>
                  {getPublishStatusBadge(app.publishStatus || "offline")}
                </div>
                <CardDescription className="text-lg mt-1"><Link href={`/apps/${app.slug}`} target="_blank" className="text-blue-500">{app.slug}</Link></CardDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {getStatusBadge(app.status)}
                  <Badge variant="outline" className="capitalize">
                    {app.type === "client" ? "客户端" : app.type === "server" ? "服务器" : "应用程序"}
                  </Badge>
                  {getSourceBadge(app.source)}
                  {app.featured && <Badge className="bg-yellow-500 hover:bg-yellow-600">精选</Badge>}
                  {app.verified && <Badge className="bg-blue-500 hover:bg-blue-600">已验证</Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium whitespace-nowrap">{app.stars?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(app.createdAt).split(" ")[0]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(app.updatedAt).split(" ")[0]}</span>
                </div>
              </div>

              <Button variant={app.publishStatus === "online" ? "destructive" : "default"} onClick={() => setIsConfirmOpen(true)} disabled={isUpdating} className="w-full sm:w-auto">
                {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Power className="h-4 w-4 mr-2" />}
                {app.publishStatus === "online" ? "下线应用" : "上线应用"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 确认对话框 */}
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认{app.publishStatus === "online" ? "下线" : "上线"}应用？</AlertDialogTitle>
              <AlertDialogDescription>{app.publishStatus === "online" ? "下线后，用户将无法访问此应用。" : "上线后，用户将可以访问此应用。"}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdating}>取消</AlertDialogCancel>
              <AlertDialogAction
                disabled={isUpdating}
                onClick={(e) => {
                  e.preventDefault();
                  handleStatusToggle();
                }}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  "确认"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CardContent>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="overview" className="col-span-1">
                概览与详情
              </TabsTrigger>
              <TabsTrigger value="metadata" className="col-span-1">
                标签与分类
              </TabsTrigger>
              <TabsTrigger value="ownership" className="col-span-1">
                所有权管理
              </TabsTrigger>
              <TabsTrigger value="related" className="col-span-1">
                相关应用
              </TabsTrigger>
              <TabsTrigger value="analysis" className="col-span-1">
                分析历史
              </TabsTrigger>
              <TabsTrigger value="ads" className="col-span-1">
                广告管理
              </TabsTrigger>
            </TabsList>

            {/* 概览与详情选项卡 */}
            <TabsContent value="overview" className="pt-4">
              <AppOverview app={app} />
            </TabsContent>

            {/* 标签与分类选项卡 */}
            <TabsContent value="metadata" className="pt-4">
              <AppMetadata appId={app.id} />
            </TabsContent>

            {/* 所有权管理选项卡 */}
            <TabsContent value="ownership" className="pt-4">
              <AppOwnership appId={app.id} app={app} />
            </TabsContent>

            {/* 相关应用选项卡 */}
            <TabsContent value="related" className="pt-4">
              <AppRelated appId={app.id} />
            </TabsContent>

            {/* 分析历史选项卡 */}
            <TabsContent value="analysis" className="pt-4">
              <AppAnalysis appId={app.id} />
            </TabsContent>

            {/* 广告管理选项卡 */}
            <TabsContent value="ads" className="pt-4">
              <AppAds appId={app.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
