"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { BarChart } from "lucide-react";
import Link from "next/link";

import { trpc } from "@/lib/trpc/client";

export function AdStatsCard() {
  const { data: adStats, isLoading } = trpc.mcpDashboard.getAdStats.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!adStats) {
    return null;
  }

  const activeAds = adStats?.filter((ad) => ad.status === "active");
  const totalImpressions = adStats?.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = adStats?.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>广告统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">总广告数</div>
              <div className="text-2xl font-bold">{adStats?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">活跃广告</div>
              <div className="text-2xl font-bold">{activeAds?.length || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">总展示次数</div>
              <div className="text-2xl font-bold">{totalImpressions?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">总点击次数</div>
              <div className="text-2xl font-bold">{totalClicks?.toLocaleString() || 0}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">平均点击率</div>
              <div className="text-2xl font-bold">{averageCtr?.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">总支出</div>
              <div className="text-2xl font-bold">
                ¥{adStats?.reduce((sum, ad) => sum + (ad.price || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
          <Separator className="my-2" />
        </div>

        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link href="/dashboard/analytics">
            <BarChart className="mr-2 h-4 w-4" />
            查看详细分析
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 