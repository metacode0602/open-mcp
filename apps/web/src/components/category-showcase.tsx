"use client";

import { McpApp } from "@repo/db/types";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

import { AppGrid } from "@/components/web/app-grid";
import { LoadMoreButton } from "@/components/web/load-more-button";
import { trpc } from "@/lib/trpc/client";

interface CategoryShowcaseProps {
  category: "client" | "server" | "application";
  selectedTag?: string | null;
  selectedCategory?: string | null;
  limit?: number;
}

const AppCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-16" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export function CategoryShowcase({
  category,
  selectedTag,
  selectedCategory,
  limit = 21,
}: CategoryShowcaseProps) {
  const [visibleCount, setVisibleCount] = useState(limit);

  const { data: apps, isLoading, error, refetch } = trpc.mcpApps.getByTypeCategoryAndTag.useQuery(
    {
      type: category,
      category: selectedCategory || undefined,
      tag: selectedTag || undefined,
    },
    {
      enabled: true,
    }
  );

  const loadMore = () => {
    setVisibleCount((prev) => prev + limit);
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AppCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>
          <p className="mb-2">获取应用数据时出错。请稍后再试。</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 空状态
  if (!apps || apps.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">没有找到应用</h3>
        <p className="text-muted-foreground">
          {selectedTag
            ? "没有与所选标签匹配的应用。"
            : selectedCategory
              ? "没有与所选分类匹配的应用。"
              : "此分类下暂无应用。"}
        </p>
      </div>
    );
  }

  // 显示应用列表
  return (
    <div>
      <AppGrid apps={apps} />
      {visibleCount < apps.length && <LoadMoreButton onClick={loadMore} />}
    </div>
  );
}
