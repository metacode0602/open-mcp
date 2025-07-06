"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export function AppsTab() {
  const { data: apps, isLoading } = trpc.mcpDashboard.getSubmittedApps.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-1" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 ml-auto" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!apps || apps.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">您还没有提交任何应用</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          提交您的 MCP 客户端、服务器或应用，加入 MCP 生态系统
        </p>
        <Button asChild>
          <Link href="/submit">
            <Plus className="mr-2 h-4 w-4" />
            提交应用
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apps.map((app) => (
        <Card key={app.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{app.name}</CardTitle>
                <CardDescription>{app.description}</CardDescription>
              </div>
              <Badge variant={app.status === "approved" ? "default" : "secondary"}>
                {app.status === "approved" ? "已批准" : "审核中"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {app.type === "client"
                  ? "客户端"
                  : app.type === "server"
                    ? "服务器"
                    : "应用"}
              </Badge>
              <span>提交于 {app.createdAt.toLocaleDateString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href={`/web/submit/${app.id}`}>
                查看详情
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 