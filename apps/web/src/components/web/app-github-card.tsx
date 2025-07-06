"use client"

import { App } from "@repo/db/types"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { ChartContainer, ChartTooltip } from "@repo/ui/components/ui/chart"
import { Separator } from "@repo/ui/components/ui/separator"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { cn } from "@repo/ui/lib/utils"
import { CalendarIcon,ExternalLinkIcon, TrendingUpIcon } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer,XAxis, YAxis } from "recharts"

import { trpc } from "@/lib/trpc/client";
import { formatNumber, fromNow } from "@/lib/utils"

// 使用tRPC返回的数据结构
interface MonthlyTrend {
  year: number
  month: number
  stars: number
  delta: number
}

interface TrendsSummary {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

interface Props {
  project: App
}

const getMonthName = (month: number): string => {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  return months[month - 1] ?? ""
}

// 主组件
export const AppGitHubCard = ({ project }: Props) => {
  // 获取月度趋势数据
  const { data: monthlyTrends, isLoading: trendsLoading } = trpc.mcpSnapshots.getSnapshotsByAppId.useQuery(
    { repoId: project.repoId || "" },
    {
      enabled: !!project.repoId,
    }
  )

  // 获取趋势汇总数据
  const { data: trends, isLoading: summaryLoading } = trpc.mcpSnapshots.getProjectTrends.useQuery(
    { repoId: project.repoId || "" },
    {
      enabled: !!project.repoId,
    }
  )

  // 计算加载状态
  const isLoadingData = trendsLoading || summaryLoading || (monthlyTrends === undefined)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-white">
              <svg className="size-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">月度 Stars 增长趋势</h3>
                  <p className="text-sm text-muted-foreground">过去12个月的 Stars 增长情况</p>
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            创建于 {fromNow(project.repoCreatedAt?.toISOString() || project.createdAt?.toISOString() || new Date().toISOString())}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoadingData ? (
          <LoadingSkeleton />
        ) : (
          <>
            <MonthlyTrendsSection trends={monthlyTrends || []} project={project} />
            <Separator />
            {trends && <TrendsSummarySection trends={trends} />}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// 统计卡片组件
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-2 rounded-lg border p-3">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <div className="text-sm font-medium">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
)

// 月度趋势图组件
const MonthlyTrendsSection = ({ trends, project }: { trends: MonthlyTrend[]; project: App }) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthlyTrend | null>(null)

  // 生成过去12个月的数据（跨年显示）
  const getLast12MonthsData = () => {
    const currentDate = new Date()
    const monthsData: MonthlyTrend[] = []

    // 生成过去12个月的数据
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      // 查找对应月份的真实数据，如果没有则使用0
      const existingData = trends.find((t) => t.year === year && t.month === month)
      const delta = existingData?.delta || 0
      const stars = existingData?.stars || 0

      monthsData.push({ year, month, delta, stars })
    }

    return monthsData
  }

  const last12MonthsData = getLast12MonthsData()

  const chartData = last12MonthsData.map(({ year, month, delta, stars }) => ({
    id: `${year}-${month}`,
    month: `${year}年${getMonthName(month)}`,
    stars: stars,
    displayMonth: month <= 6 ? `${getMonthName(month)}` : getMonthName(month),
    year: year,
    fullData: { year, month, delta, stars },
  }))

  const totalStars = chartData.reduce((sum, d) => sum + d.stars, 0)
  const hasData = trends.length > 0

  const handleBarClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload.fullData
      setSelectedMonth(clickedData)
    }
  }

  return (
    <div className="space-y-4">
      {/* 选中月份的详细信息 */}
      {selectedMonth && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {selectedMonth.year}年{getMonthName(selectedMonth.month)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(null)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
              <span className="text-lg font-semibold text-green-600">+{formatNumber(selectedMonth.delta)}</span>
              <span className="text-sm text-muted-foreground">Stars {selectedMonth.stars}</span>
            </div>
            {totalStars > 0 && selectedMonth.delta > 0 && (
              <div className="text-sm text-muted-foreground">
                占总增长的 {((selectedMonth.delta / totalStars) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="flex h-[320px] w-full items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <TrendingUpIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">暂无趋势数据</p>
            <p className="text-xs text-muted-foreground">该项目的 Stars 数据正在收集中</p>
          </div>
        </div>
      ) : (
        <ChartContainer
          config={{
            stars: {
              label: "Stars",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[320px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }} onClick={handleBarClick}>
              <XAxis
                dataKey="displayMonth"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
                width={60}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]?.payload.fullData
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <div className="font-medium">
                          {data.year}年{getMonthName(data.month)}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <div className="h-2 w-2 rounded-full bg-[var(--color-stars)]" />
                          <span>Stars: +{formatNumber(data.delta)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">点击查看详细信息</div>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              />
              <Bar
                dataKey="stars"
                fill="var(--color-stars)"
                radius={[3, 3, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* 年份分隔线指示器 */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span>2024年</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>2025年</span>
        </div>
      </div>
    </div>
  )
}

// 趋势摘要组件
const TrendsSummarySection = ({ trends }: { trends: TrendsSummary }) => {
  const summaryItems = [
    { label: "昨日", value: trends.daily, period: "天" },
    { label: "本周", value: trends.weekly, period: "周" },
    { label: "本月", value: trends.monthly, period: "月" },
    { label: "本年", value: trends.yearly, period: "年" },
  ]

  // 检查是否有有效数据
  const hasValidData = summaryItems.some(item => item.value !== 0)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Stars 增长摘要</h3>
        <p className="text-sm text-muted-foreground">不同时间段的 Stars 增长统计</p>
      </div>

      {!hasValidData ? (
        <div className="flex h-32 w-full items-center justify-center rounded-lg border bg-muted/50">
          <div className="text-center">
            <TrendingUpIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">暂无增长数据</p>
            <p className="text-xs text-muted-foreground">该项目的增长数据正在收集中</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryItems.map((item, index) => (
            <TrendCard key={index} {...item} />
          ))}
        </div>
      )}
    </div>
  )
}

// 趋势卡片组件
const TrendCard = ({ label, value, period }: { label: string; value: number; period: string }) => {
  const isPositive = value > 0
  const isZero = value === 0
  const isNegative = value < 0

  return (
    <div className="rounded-lg border p-4 text-center transition-all duration-200 hover:shadow-md">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-2xl font-bold",
          isPositive && "text-green-600",
          isZero && "text-gray-500",
          isNegative && "text-red-600",
        )}
      >
        {isPositive && "+"}
        {formatNumber(Math.abs(value))}
      </div>
      <div className="text-xs text-muted-foreground">Stars / {period}</div>
    </div>
  )
}

// 加载骨架屏组件
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-[300px] w-full" />
    </div>
    <Separator />
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  </div>
)
