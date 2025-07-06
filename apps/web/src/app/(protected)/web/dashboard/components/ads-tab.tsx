"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { AlertCircle, ArrowRight, BarChart, Calendar, Plus, Settings } from "lucide-react";
import Link from "next/link";

import { AdStatusBadge } from "@/components/ad-status-badge";
import { trpc } from "@/lib/trpc/client";

export function AdsTab() {
  const { data: ads, isLoading } = trpc.mcpDashboard.getAds.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>

        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-1" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <Skeleton className="h-4 w-16 mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto mt-1" />
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <Skeleton className="h-4 w-16 mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto mt-1" />
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <Skeleton className="h-4 w-16 mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto mt-1" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">您还没有发布任何广告</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          在 OpenMCP 平台上推广您的应用，接触更多开发者
        </p>
        <Button asChild>
          <Link href="/advertise">
            <BarChart className="mr-2 h-4 w-4" />
            发布广告
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">您的广告</h3>
        <Button asChild>
          <Link href="/advertise">
            <Plus className="mr-2 h-4 w-4" />
            发布新广告
          </Link>
        </Button>
      </div>

      {ads.map((ad) => (
        <Card key={ad.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={ad.type === "listing" ? "outline" : "secondary"}>
                    {ad.type === "listing" ? "列表广告" : "横幅广告"}
                  </Badge>
                  <AdStatusBadge status={ad.status} />
                </div>
                <CardTitle>{ad.title}</CardTitle>
                <CardDescription>{ad.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="font-medium">¥{ad.price.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">
                  {ad.startDate.toLocaleDateString()} 至 {ad.endDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ad.status === "active" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">展示次数</div>
                    <div className="text-xl font-bold">{ad.impressions?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">点击次数</div>
                    <div className="text-xl font-bold">{ad.clicks?.toLocaleString() || 0}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">点击率</div>
                    <div className="text-xl font-bold">{ad.ctr || 0}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>广告效果</span>
                    <span>良好</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            )}

            {ad.status === "pending" && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    等待审核
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    您的广告正在审核中，通常需要1-2个工作日
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Calendar className="h-4 w-4" />
              <span>创建于 {ad.createdAt.toLocaleDateString()}</span>
              <span>•</span>
              <Link
                href={ad.url}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ad.url.replace(/^https?:\/\//, "")}
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <Settings className="mr-1 h-3 w-3" />
              管理广告
            </Button>
            {ad.status === "active" && (
              <Button size="sm" asChild>
                <Link href={`/dashboard/ads/${ad.id}/analytics`}>
                  查看详细分析
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 