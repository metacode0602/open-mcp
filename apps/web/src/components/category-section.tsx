"use client";

import { AppGrid } from "@/components/web/app-grid";
import { Container } from "@/components/web/container";
import { SectionHeader } from "@/components/web/section-header";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

interface CategorySectionProps {
  category: string;
  limit?: number;
  viewAllLink?: boolean;
}

export function CategorySection({ category, limit = 6, viewAllLink = true }: CategorySectionProps) {
  const {
    data: apps,
    isLoading,
    error,
    refetch
  } = trpc.mcpRecommendations.getRecommendedAppsByType.useQuery(
    {
      type: category as "client" | "server" | "application",
      limit
    },
    {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30 * 1000, // 数据30秒内视为新鲜
    }
  );

  const titles = {
    client: "MCP 客户端",
    server: "MCP 服务器",
    application: "AI 应用"
  };

  const descriptions = {
    client: "浏览支持 MCP 协议的客户端应用",
    server: "探索提供 MCP 服务的服务器应用",
    application: "发现开源 AI 应用"
  };

  if (isLoading) {
    return (
      <Container>
        <SectionHeader
          title={titles[category as keyof typeof titles] || "应用"}
          description={descriptions[category as keyof typeof descriptions]}
          viewAllLink={viewAllLink ? `/category/${category}` : undefined}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>
            获取应用列表时出现错误
            <Button
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader
        title={titles[category as keyof typeof titles] || "应用"}
        description={descriptions[category as keyof typeof descriptions]}
        viewAllLink={viewAllLink ? `/category/${category}` : undefined}
      />
      {/* @ts-expect-error */}
      <AppGrid apps={apps || []} /> {/* 确保传递空数组作为fallback */}
    </Container>
  );
}
