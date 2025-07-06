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
import { ArrowLeft, BarChart, Edit, Power } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ImagePreview } from "@/components/image-preview";
import { trpc } from "@/lib/trpc/client";
import { formatDate, getAssetUrl } from "@/lib/utils";

export default function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

  // TRPC queries and mutations
  const utils = trpc.useUtils();
  const { data: ad, isLoading: isLoadingAd } = trpc.ads.getById.useQuery({
    id: id as string,
  });

  const { mutate: updateStatus, isPending: isUpdating } = trpc.ads.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate the query to refresh data
      utils.ads.getById.invalidate({ id: id as string });
      toast.success("状态更新成功", {
        description: `广告已${isActive ? "暂停" : "启用"}`,
      });
    },
    onError: (error) => {
      // Revert the local state if the mutation fails
      setIsActive(!isActive);
      toast.error("操作失败", {
        description: error.message,
      });
    },
  });

  // Initialize isActive state based on ad status
  const [isActive, setIsActive] = useState(false);

  // Use useEffect instead of useState for initialization
  useEffect(() => {
    if (ad) {
      setIsActive(ad.status === "active");
    }
  }, [ad]);

  const handleToggleStatus = useCallback(() => {
    if (!ad) return;

    const newStatus = isActive ? "paused" : "active";
    updateStatus({
      id: ad.id,
      status: newStatus
    });

    setIsActive(!isActive);
  }, [ad, isActive, updateStatus]);

  // 加载中状态
  if (isLoadingAd) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium">加载中...</h3>
        </div>
      </div>
    );
  }

  // 广告不存在状态
  if (!ad) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium">广告信息不存在</h3>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            返回上一页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header section - fixed height */}
      <div className="flex-none">
        <AdminPageHeader
          title="广告详情"
          description="查看和管理广告信息"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/ads">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回列表
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/ads/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={isActive ? "destructive" : "default"}
                    disabled={isUpdating}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {isUpdating ? "处理中..." : (isActive ? "暂停" : "启用")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认{isActive ? "暂停" : "启用"}广告？</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作将{isActive ? "暂停" : "启用"}广告 "{ad.title}"。
                      {isActive ? "暂停后广告将不再展示。" : "启用后广告将开始展示。"}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleToggleStatus}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "处理中..." : "确认"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          }
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 auto-rows-min">
          {/* Basic Info Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>广告的基本信息和状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-row gap-4">
                      <p className="text-sm font-medium">广告名称</p>
                      <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "运行中" : "已暂停"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ad.title}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">广告类型</p>
                    <p className="text-sm text-muted-foreground">{ad.type === "banner" ? "横幅广告" : "其他类型"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">展示位置</p>
                    <p className="text-sm text-muted-foreground">{ad.placement}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">应用名称</p>
                    <p className="text-sm text-muted-foreground">{ad.placement}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">描述</p>
                  <p className="text-sm text-muted-foreground">{ad.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">目标链接</p>
                  <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all">
                    {ad.url}
                  </a>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">广告图片</p>
                  <div className="relative size-32">
                    <img
                      src={getAssetUrl(ad.imageUrl)}
                      alt={ad.title}
                      className="w-full max-w-md h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setIsImagePreviewOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>投放信息</CardTitle>
              <CardDescription>广告的投放时间和预算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2">
                <div className="space-y-1 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">开始日期</p>
                    <p className="text-sm text-muted-foreground">{formatDate(ad.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">结束日期</p>
                    <p className="text-sm text-muted-foreground">{formatDate(ad.endDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">预算</p>
                    <p className="text-sm text-muted-foreground">¥{ad.budget}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">已花费</p>
                    <p className="text-sm text-muted-foreground">¥{ad.spent}</p>
                  </div>
                </div>
                <div className="space-y-1 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">展示次数</p>
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      <p className="text-sm text-muted-foreground">{ad.impressions}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">点击次数</p>
                    <p className="text-sm text-muted-foreground">{ad.clicks}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">点击率</p>
                    <p className="text-sm text-muted-foreground">{ad.ctr}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">每次点击成本</p>
                    <p className="text-sm text-muted-foreground">¥{ad.cpc}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Data Card - spans full width */}
          <Card className="md:col-span-2 h-fit">
            <CardHeader>
              <CardTitle>每日数据</CardTitle>
              <CardDescription>最近3天的广告效果数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Reduce chart height */}
                <div>
                  <h3 className="text-lg font-medium mb-2">效果分析</h3>
                  <div className="h-[200px] border rounded-md flex items-center justify-center">
                    <BarChart className="h-12 w-12 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">图表数据加载中...</p>
                  </div>
                </div>

                {/* Make grid more compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-3">每日数据</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-2 text-left">日期</th>
                            <th className="px-4 py-2 text-right">展示</th>
                            <th className="px-4 py-2 text-right">点击</th>
                            <th className="px-4 py-2 text-right">点击率</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { date: "2025-03-01", impressions: 200, clicks: 10, ctr: 5.0 },
                            { date: "2025-03-02", impressions: 250, clicks: 15, ctr: 6.0 },
                            { date: "2025-03-03", impressions: 180, clicks: 8, ctr: 4.4 },
                            { date: "2025-03-04", impressions: 300, clicks: 12, ctr: 4.0 },
                            { date: "2025-03-05", impressions: 270, clicks: 14, ctr: 5.2 },
                          ].map((day) => (
                            <tr key={day.date} className="border-t">
                              <td className="px-4 py-2">{formatDate(day.date)}</td>
                              <td className="px-4 py-2 text-right">{day.impressions}</td>
                              <td className="px-4 py-2 text-right">{day.clicks}</td>
                              <td className="px-4 py-2 text-right">{day.ctr}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">设备分布</h3>
                    <div className="border rounded-md p-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>移动设备</span>
                            <span>65%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "65%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>桌面设备</span>
                            <span>25%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "25%" }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>平板设备</span>
                            <span>10%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "10%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Keep ImagePreview component */}
      <ImagePreview
        src={getAssetUrl(ad.imageUrl)}
        alt={ad.title}
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
      />
    </div>
  );
}
