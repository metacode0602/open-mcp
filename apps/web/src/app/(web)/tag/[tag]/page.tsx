"use client";

import { use, useState } from "react";
import { Container } from "@/components/web/container";
import { PageHeader } from "@/components/web/page-header";
import { AppGrid } from "@/components/web/app-grid";
import { LoadMoreButton } from "@/components/web/load-more-button";
import { SearchBar } from "@/components/search-bar";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export default function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const [visibleCount, setVisibleCount] = useState(9);

  // 使用tRPC查询标签相关应用
  const {
    data: apps,
    isLoading,
    error,
    refetch,
  } = trpc.mcpApps.getByTag.useQuery({ tagName: tag });

  const loadMore = () => {
    setVisibleCount((prev) => prev + 9);
  };

  // 加载状态
  if (isLoading) {
    return (
      <Container className="py-10">
        <Skeleton className="h-16 w-2/3 mb-6" />
        <Skeleton className="h-10 w-full mb-8" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </Container>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Container className="py-10">
        <PageHeader title={`标签: ${tag}`} description="加载标签数据时出错" backLink={{ href: "/", label: "返回首页" }} />

        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>
            <p className="mb-2">获取标签相关应用时出错。请稍后再试。</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  // 没有找到应用
  if (!apps || apps.length === 0) {
    return (
      <Container className="py-10">
        <PageHeader title={`标签: ${decodeURIComponent(tag)}`} description="没有找到相关应用" backLink={{ href: "/", label: "返回首页" }} />

        <Alert variant="default" className="mt-6">
          <AlertTitle>没有找到相关应用</AlertTitle>
          <AlertDescription>没有找到带有 "{decodeURIComponent(tag)}" 标签的应用。</AlertDescription>
        </Alert>
      </Container>
    );
  }

  // 统计各种类型的应用数量
  const clientCount = apps.filter((app) => app.type === "client").length;
  const serverCount = apps.filter((app) => app.type === "server").length;
  const applicationCount = apps.filter((app) => app.type === "application").length;

  // 显示的应用
  const visibleApps = apps.slice(0, visibleCount);

  return (
    <Container className="py-10">
      <PageHeader title={`标签: ${decodeURIComponent(tag)}`} description={`浏览所有带有 "${decodeURIComponent(tag)}" 标签的应用 - 共 ${apps.length} 个应用`} backLink={{ href: "/", label: "返回首页" }}>
        <div className="flex flex-wrap gap-2 mt-4 text-sm text-muted-foreground">
          {clientCount > 0 && <span>{clientCount} 个客户端</span>}
          {serverCount > 0 && <span>• {serverCount} 个服务器</span>}
          {applicationCount > 0 && <span>• {applicationCount} 个应用</span>}
        </div>
      </PageHeader>

      <div className="mb-8">
        <SearchBar />
      </div>

      <AppGrid apps={visibleApps} />

      {visibleCount < apps.length && <LoadMoreButton onClick={loadMore} />}
    </Container>
  );
}
