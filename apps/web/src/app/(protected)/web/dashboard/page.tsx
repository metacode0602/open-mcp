"use client";
import {
  AlertCircle,
  BarChart,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@repo/ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { StatsCard } from "./components/stats-card";
import { AdStatsCard } from "./components/ad-stats-card";
import { AppsTab } from "./components/apps-tab";
import { AdsTab } from "./components/ads-tab";
import { PaymentsTab } from "./components/payments-tab";
import { ClaimsTab } from "./components/claims-tab";
import { SuggestionsTab } from "./components/suggestions-tab";
import { useDashboardStore } from "./store/dashboard-store";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { activeTab, setActiveTab, error } = useDashboardStore();

  return (
    <div className="py-4 px-4 md:px-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">仪表盘</h1>
            <p className="text-muted-foreground">管理您的应用、部署和广告</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/submit">
                <Plus className="mr-2 h-4 w-4" />
                提交新应用
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/advertise">
                <BarChart className="mr-2 h-4 w-4" />
                发布广告
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="mb-6">
          <StatsCard />
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_250px]">
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="apps">我的应用</TabsTrigger>
                {/* <TabsTrigger value="deployments">我的部署</TabsTrigger> */}
                <TabsTrigger value="ads">我的广告</TabsTrigger>
                <TabsTrigger value="payments">支付记录</TabsTrigger>
                <TabsTrigger value="claims">所有权申请</TabsTrigger>
                <TabsTrigger value="suggestions">我的建议</TabsTrigger>
              </TabsList>

              <TabsContent value="apps" className="space-y-4 mt-6">
                <AppsTab />
              </TabsContent>
              {/* 
              <TabsContent value="deployments" className="space-y-4 mt-6">
                <DeploymentsTab />
              </TabsContent> */}

              <TabsContent value="ads" className="space-y-4 mt-6">
                <AdsTab />
              </TabsContent>

              <TabsContent value="payments" className="space-y-4 mt-6">
                <PaymentsTab />
              </TabsContent>

              <TabsContent value="claims" className="space-y-4 mt-6">
                <ClaimsTab />
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4 mt-6">
                <SuggestionsTab />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <AdStatsCard />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
