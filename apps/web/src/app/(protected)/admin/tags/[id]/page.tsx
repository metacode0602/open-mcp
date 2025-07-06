"use client";

import { ArrowLeft, Edit, Power, Tags } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

export default function TagDetailPage() {
  const params = useParams();

  const [isOnline, setIsOnline] = useState(true);

  // 使用 tRPC 获取标签数据
  const {
    data: tag,
    isLoading,
    error,
    refetch,
  } = trpc.tags.getById.useQuery({
    id: params.id as string,
  });

  // 使用 tRPC 更新标签状态
  const { mutate: updateTag } = trpc.tags.updateDeleted.useMutation({
    onSuccess: () => {
      toast.success("状态已更新", {
        description: `标签已${isOnline ? "上线" : "下线"}`,
      });
      refetch();
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      });
    },
  });

  const handleToggleStatus = () => {
    updateTag({
      id: params.id as string,
      deleted: !isOnline,
    });
    setIsOnline(!isOnline);
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

  if (isLoading || !tag) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="标签详情"
        description="查看和管理标签信息"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/tags">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/tags/${params.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={isOnline ? "destructive" : "default"}>
                  <Power className="mr-2 h-4 w-4" />
                  {isOnline ? "下线" : "上线"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    确认{isOnline ? "下线" : "上线"}标签？
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将{isOnline ? "下线" : "上线"}标签 "{tag.name}"。
                    {isOnline
                      ? "下线后该标签下的应用将无法被用户访问。"
                      : "上线后该标签下的应用将可以被用户访问。"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleStatus}>
                    确认
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>标签的基本信息和状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">标签名称</p>
                <p className="text-sm text-muted-foreground">{tag.name}</p>
              </div>
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "已上线" : "已下线"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">标签标识</p>
              <p className="text-sm text-muted-foreground">{tag.slug}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">来源</p>
              <Badge variant="outline">{tag.source}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">类型</p>
              <Badge variant="outline">{tag.type}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">描述</p>
              <p className="text-sm text-muted-foreground">{tag.description}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">创建时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tag.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">更新时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(tag.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
            <CardDescription>标签的应用统计</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">应用数量</p>
              <div className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">
                  {tag.totalApps || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>相关标签</CardTitle>
            <CardDescription>与该标签相关的其他标签</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {tag.relatedTags.map((relatedTag) => (
                <Card key={relatedTag.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {relatedTag.name}
                    </CardTitle>
                    <CardDescription>
                      {relatedTag.appCount} 个应用
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/tags/${relatedTag.id}`}>
                        查看详情
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
