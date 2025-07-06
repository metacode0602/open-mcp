"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Server } from "lucide-react";
import Link from "next/link";

import { trpc } from "@/lib/trpc/client";

export function DeploymentsTab() {
  const { data: services, isLoading } = trpc.mcpDashboard.getDeployedServices.useQuery();

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
              <Skeleton className="h-4 w-32" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">您还没有部署任何服务</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          部署 MCP 服务器，开始使用 MCP 功能
        </p>
        <Button asChild>
          <Link href="/deploy">
            <Server className="mr-2 h-4 w-4" />
            部署服务
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* {services && services.map((service) => (
        <Card key={service.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.url}</CardDescription>
              </div>
              <Badge variant={service.status === "running" ? "default" : "destructive"}>
                {service.status === "running" ? "运行中" : "已停止"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              部署于 {service.deployedAt.toLocaleDateString()}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <Settings className="mr-1 h-3 w-3" />
              管理
            </Button>
            <Button size="sm" asChild>
              <Link
                href={`https://${service.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                访问
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))} */}
    </div>
  );
} 