"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { Container } from "@/components/web/container";
import { AppGrid } from "@/components/web/app-grid";
import { LoadMoreButton } from "@/components/web/load-more-button";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";

  const [visibleCount, setVisibleCount] = useState(12);

  // 使用tRPC进行搜索查询
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = trpc.mcpSearch.searchApps.useQuery(
    {
      query,
      category: category === "all" ? undefined : category,
      limit: 100, // 获取较多结果，前端分页显示
    },
    {
      // 禁用自动重新获取，因为这是基于用户输入的搜索
      enabled: query.length > 0,
      // 不缓存搜索结果
      staleTime: 0,
    }
  );

  // 重置可见数量当搜索参数变化时
  useEffect(() => {
    setVisibleCount(12);
  }, [query, category]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  // 显示的应用
  const visibleApps = searchResults?.slice(0, visibleCount) || [];

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">搜索结果</h1>

      <div className="mb-8">
        <SearchBar defaultValue={query} defaultCategory={category} />
      </div>

      <div className="space-y-2 mb-6">
        <p className="text-muted-foreground">
          {query ? `搜索 "${query}" 的结果` : "所有结果"}
          {category !== "all" ? ` - 分类: ${category}` : ""}
          {searchResults && ` (共 ${searchResults.length} 个)`}
        </p>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>搜索失败</AlertTitle>
          <AlertDescription>
            <p className="mb-2">搜索时出错。请稍后再试。</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 空结果状态 */}
      {!isLoading && !error && searchResults && searchResults.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">没有找到相关结果</h3>
          <p className="text-muted-foreground mt-2">尝试使用不同的关键词或浏览分类</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            返回首页
          </Button>
        </div>
      )}

      {/* 结果列表 */}
      {!isLoading && !error && searchResults && searchResults.length > 0 && (
        <>
          {/* @ts-expect-error */}
          <AppGrid apps={visibleApps} />
          {visibleCount < searchResults.length && <LoadMoreButton onClick={loadMore} />}
        </>
      )}
    </Container>
  );
}
