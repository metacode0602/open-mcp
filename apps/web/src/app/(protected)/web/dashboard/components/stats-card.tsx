"use client";

import { BarChart, Calendar, Server, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";

export function StatsCard() {
  const { data, isPending: isLoading } = trpc.mcpDashboard.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const stats = [
    {
      title: "总应用数",
      value: data?.apps ?? 0,
      icon: Server,
      description: "已提交的应用总数",
    },
    {
      title: "活跃部署",
      value: data?.services ?? 0,
      icon: Shield,
      description: "正在运行的部署数量",
    },
    {
      title: "本月广告",
      value: data?.ads ?? 0,
      icon: BarChart,
      description: "本月投放的广告数量",
    },
    {
      title: "待处理申请",
      value: data?.claims ?? 0,
      icon: Calendar,
      description: "待处理的所有权申请",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>统计概览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}