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
import { ArrowLeft, Edit, FolderTree, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { trpc } from "@/lib/trpc/client";

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: categoryId } = use(params);
  const utils = trpc.useUtils()

  // 使用 tRPC 获取分类详情
  const {
    data: category,
    isLoading,
    error,
    refetch
  } = trpc.categories.getById.useQuery({ id: categoryId });

  // 使用 tRPC 更新分类状态
  const { mutate: updateCategory, isPending: isUpdating } = trpc.categories.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(`${category?.status === "offline" ? "上线" : "下线"}成功`, {
        description: `分类已${category?.status === "offline" ? "上线" : "下线"}`,
      });
      utils.categories.invalidate()
    },
    onError: (error) => {
      toast.error("状态更新失败", {
        description: error.message,
      });
    },
  });

  // 使用 tRPC 删除分类
  const { mutate: deleteCategory, isPending: isDeleting } = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("分类已删除", {
        description: "分类已成功删除",
      });
      utils.categories.invalidate()
      router.push("/admin/categories");
    },
    onError: (error) => {
      toast.error("删除失败", {
        description: error.message,
      });
    },
  });

  // 处理状态切换
  const handleToggleStatus = () => {
    if (!category) return;

    updateCategory({
      id: category.id,
      status: category.status === "offline" ? "online" : "offline",
    });
  };

  // 处理删除分类
  const handleDeleteCategory = () => {
    if (!category) return;
    deleteCategory({ id: category.id });
  };

  // 错误处理
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">加载失败</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/categories")}
          >
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="分类详情"
          description="查看和管理分类信息"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/categories">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回列表
                </Link>
              </Button>
              <Skeleton className="h-10 w-24" />
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>分类的基本信息和状态</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
              <CardDescription>分类的应用统计</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 分类不存在
  if (!category) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">分类不存在</h3>
          <p className="text-sm text-muted-foreground">请求的分类不存在或已被删除</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/categories")}
          >
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const isOnline = category.status === "online";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="分类详情"
        description="查看和管理分类信息"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/categories/${categoryId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={isOnline ? "destructive" : "default"} disabled={isUpdating}>
                  <Power className="mr-2 h-4 w-4" />
                  {isUpdating ? "处理中..." : isOnline ? "下线" : "上线"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    确认{isOnline ? "下线" : "上线"}分类？
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将{isOnline ? "下线" : "上线"}分类 "{category.name}"。
                    {isOnline
                      ? "下线后该分类下的应用将无法被用户访问。"
                      : "上线后该分类下的应用将可以被用户访问。"}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? "删除中..." : "删除"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除分类？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除分类 "{category.name}"。删除后无法恢复，且会影响使用此分类的应用。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCategory}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    确认删除
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
            <CardDescription>分类的基本信息和状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">分类名称</p>
                <p className="text-sm text-muted-foreground">{category.name}</p>
              </div>
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? "已上线" : "已下线"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">分类标识</p>
              <p className="text-sm text-muted-foreground">{category.slug}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">描述</p>
              <p className="text-sm text-muted-foreground">
                {category.description || "无描述"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">创建时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(category.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">更新时间</p>
              <p className="text-sm text-muted-foreground">
                {new Date(category.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
            <CardDescription>分类的应用统计</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">应用数量</p>
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                <p className="text-sm text-muted-foreground">
                  {category.appsCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {category.parent && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>父分类</CardTitle>
              <CardDescription>该分类的父分类信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {category.parent.name}
                    </CardTitle>
                    <CardDescription>
                      {category.parent.appsCount || 0} 个应用
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/categories/${category.parent.id}`}>
                        查看详情
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
