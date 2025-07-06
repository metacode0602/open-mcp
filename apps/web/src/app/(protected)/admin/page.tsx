"use client"

import type React from "react"

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart,
  CheckCircle,
  Clock,
  CreditCard,
  Lightbulb,
  Package,
  Shield,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { PageHeader } from "@/components/admin/page-header"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { trpc } from "@/lib/trpc/client"
// 模拟统计数据
const stats = {
  users: {
    total: 3254,
    change: 12.5,
    increasing: true,
  },
  apps: {
    total: 487,
    change: 8.3,
    increasing: true,
  },
  ads: {
    total: 156,
    change: 5.2,
    increasing: true,
  },
  revenue: {
    total: 125600,
    change: 15.8,
    increasing: true,
  },
}

// 模拟待处理项
const pendingItems = {
  apps: 12,
  claims: 8,
  suggestions: 24,
  ads: 15,
  payments: 5,
}

// 模拟最近活动
const recentActivities = [
  {
    id: "1",
    type: "app_submission",
    title: "新应用提交",
    description: "用户提交了新应用 'AI Code Assistant'",
    timestamp: "10分钟前",
    status: "pending",
    user: "李明",
    link: "/admin/apps/pending/1",
  },
  {
    id: "2",
    type: "claim",
    title: "所有权申请",
    description: "用户申请了 'Claude Desktop' 的所有权",
    timestamp: "30分钟前",
    status: "pending",
    user: "张三",
    link: "/admin/claims/2",
  },
  {
    id: "3",
    type: "ad_purchase",
    title: "广告购买",
    description: "用户购买了价值 ¥2,000 的横幅广告",
    timestamp: "1小时前",
    status: "completed",
    user: "王五",
    link: "/admin/ads/3",
  },
]

// 添加活动图标函数
function getActivityIcon(type: string) {
  switch (type) {
    case "app_submission":
      return <Package className="h-4 w-4 text-muted-foreground" />
    case "claim":
      return <Shield className="h-4 w-4 text-muted-foreground" />
    case "ad_purchase":
      return <BarChart className="h-4 w-4 text-muted-foreground" />
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }
}

// 添加活动状态徽章函数
function getActivityStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge variant="default">已完成</Badge>
    case "pending":
      return <Badge variant="secondary">待处理</Badge>
    case "failed":
      return <Badge variant="destructive">失败</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState("week")

  // 使用 TRPC 查询
  const { data: stats, isLoading: isStatsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: pendingItems, isLoading: isPendingLoading } = trpc.dashboard.getPendingItems.useQuery();
  const { data: recentActivities, isLoading: isActivitiesLoading } = trpc.dashboard.getRecentActivities.useQuery();

  if (isStatsLoading || isPendingLoading || isActivitiesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="管理员仪表盘" description="查看平台概览和管理待处理项" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="用户总数"
          value={stats?.users.total || 0}
          change={stats?.users.change || 0}
          increasing={stats?.users.increasing || false}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="应用总数"
          value={stats?.apps.total ?? 0}
          change={stats?.apps.change}
          increasing={stats?.apps.increasing}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="活跃广告"
          value={stats?.ads.total ?? 0}
          change={stats?.ads.change}
          increasing={stats?.ads.increasing}
          icon={<BarChart className="h-4 w-4" />}
        />
        <StatCard
          title="总收入"
          value={`¥${stats?.revenue.total ? stats?.revenue.total.toLocaleString() : "0.00"}`}
          change={stats?.revenue.change}
          increasing={stats?.revenue.increasing}
          icon={<CreditCard className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>平台数据趋势</CardTitle>
              <CardDescription>查看平台关键指标的变化趋势</CardDescription>
            </div>
            <Tabs defaultValue={period} onValueChange={setPeriod}>
              <TabsList className="grid grid-cols-3 h-8">
                <TabsTrigger value="week" className="text-xs">
                  周
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs">
                  月
                </TabsTrigger>
                <TabsTrigger value="year" className="text-xs">
                  年
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">图表区域</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>待处理项</CardTitle>
            <CardDescription>需要您审核的项目</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Link
                href="/admin/apps/pending"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>应用审核</span>
                </div>
                <Badge>{pendingItems?.apps || 0}</Badge>
              </Link>
              <Link
                href="/admin/claims"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>所有权申请</span>
                </div>
                <Badge>{pendingItems?.claims}</Badge>
              </Link>
              <Link
                href="/admin/suggestions"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span>功能建议</span>
                </div>
                <Badge>{pendingItems?.suggestions}</Badge>
              </Link>
              <Link
                href="/admin/ads/pending"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <span>广告审核</span>
                </div>
                <Badge>{pendingItems?.ads}</Badge>
              </Link>
              <Link
                href="/admin/payments/pending"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>支付处理</span>
                </div>
                <Badge>{pendingItems?.payments}</Badge>
              </Link>
            </div>
            <Button className="w-full" asChild>
              <Link href="/admin/pending">查看所有待处理项</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>平台上的最新活动和事件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-medium truncate">{activity.title}</div>
                      {getActivityStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{activity.summary}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {activity.createdAt.toLocaleString()} • {activity?.user?.name ?? "未知用户"}
                      </span>
                      <Link href={activity.link} className="text-primary hover:underline">
                        查看详情
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>平台各组件的运行状态</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>API 服务</span>
                </div>
                <Badge variant="outline" className="text-green-500">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>数据库</span>
                </div>
                <Badge variant="outline" className="text-green-500">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>存储服务</span>
                </div>
                <Badge variant="outline" className="text-green-500">
                  正常
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>搜索服务</span>
                </div>
                <Badge variant="outline" className="text-amber-500">
                  延迟
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>支付系统</span>
                </div>
                <Badge variant="outline" className="text-green-500">
                  正常
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/system">查看详细状态</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  increasing?: boolean
  icon?: React.ReactNode
  className?: string
}

function StatCard({ title, value, change, increasing, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof change !== "undefined" && (
          <p
            className={`flex items-center text-xs ${increasing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {increasing ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
            <span>{change}% 较上月</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

