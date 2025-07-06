"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export function UserInfoCard() {
  const { data: user, isLoading, isError } = trpc.mcpDashboard.getUserInfo.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  if (isError) {
    return <div>Error loading user info</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>账户信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
            <Image
              src={user.image || "/placeholder.svg"}
              alt={user.name || ""}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/auth/settings">
            <Settings className="mr-2 h-4 w-4" />
            账户设置
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
} 