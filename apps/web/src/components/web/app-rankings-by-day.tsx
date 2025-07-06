"use client"

import { useState, useEffect } from "react"
import { DateSelector } from "@/components/date-selector"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { StarIcon, GitForkIcon, CodeIcon, CalendarIcon, VerifiedIcon, FeaturedIcon } from "@/components/icons"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ArrowUpRight } from "lucide-react"

type App = {
  id: string
  slug: string
  name: string
  categoryId?: string
  description: string
  longDescription?: string
  type: "client" | "server" | "application"
  deployable: boolean
  source: "automatic" | "submitted" | "admin"
  status: "pending" | "approved" | "rejected" | "archived"
  publishStatus: "online" | "offline"
  analysed: boolean
  icon?: string
  banner?: string
  pics?: string[]
  website?: string
  github?: string
  docs?: string
  version?: string
  license?: string
  stars: number
  featured: boolean
  scenario?: string
  forks: number
  watchers: number
  primaryLanguage?: string
  languages?: string[]
  commits: number
  releases: number
  issues: number
  pullRequests: number
  contributors: number
  lastCommit?: Date | null
  supportedServers?: string[]
  features?: string[]
  tools?: Record<string, boolean>
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

interface AppRankingsByDayProps {
  type: string
}

export function AppRankingsByDay({ type }: AppRankingsByDayProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [dailyApps, setDailyApps] = useState<App[]>([])
  const [weeklyApps, setWeeklyApps] = useState<App[]>([])
  const [monthlyApps, setMonthlyApps] = useState<App[]>([])

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true)
      try {
        // 获取每日排行
        const dailyResponse = await fetch(
          `/api/apps?type=${type}&timeframe=daily&date=${selectedDate.toISOString().split("T")[0]}`,
        )
        const dailyData = await dailyResponse.json()
        setDailyApps(dailyData)

        // 获取每周排行
        const weeklyResponse = await fetch(
          `/api/apps?type=${type}&timeframe=weekly&date=${selectedDate.toISOString().split("T")[0]}`,
        )
        const weeklyData = await weeklyResponse.json()
        setWeeklyApps(weeklyData)

        // 获取每月排行
        const monthlyResponse = await fetch(
          `/api/apps?type=${type}&timeframe=monthly&date=${selectedDate.toISOString().split("T")[0]}`,
        )
        const monthlyData = await monthlyResponse.json()
        setMonthlyApps(monthlyData)
      } catch (error) {
        console.error("获取应用数据失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [type, selectedDate])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  const formattedDate = format(selectedDate, "yyyy年MM月dd日", { locale: zhCN })

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold">{isToday ? "今日" : formattedDate}应用排行榜</h2>
        <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      </div>

      <div className="grid gap-8">
        <section>
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold">每日排行</h3>
            <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>每天00:00 UTC更新</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? renderSkeletons(3) : renderApps(dailyApps)}
          </div>
        </section>

        <section>
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold">每周排行</h3>
            <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>每周一00:00 UTC更新</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? renderSkeletons(3) : renderApps(weeklyApps)}
          </div>
        </section>

        <section>
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-semibold">每月排行</h3>
            <div className="ml-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>每月1日00:00 UTC更新</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? renderSkeletons(3) : renderApps(monthlyApps)}
          </div>
        </section>
      </div>
    </div>
  )
}

function renderApps(apps: App[]) {
  return apps.map((app) => (
    <Card key={app.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <img
            src={app.icon || "/placeholder.svg?height=64&width=64"}
            alt={app.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold">{app.name}</CardTitle>
              {app.verified && <div><VerifiedIcon className="w-4 h-4 text-blue-500" /> <span>已验证</span></div>}
              {app.featured && <div><FeaturedIcon className="w-4 h-4 text-yellow-500" /><span>推荐</span></div>}
            </div>
            <CardDescription className="line-clamp-2">{app.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{getTypeLabel(app.type)}</Badge>
          <Badge variant="outline">{getStatusLabel(app.status)}</Badge>
          {app.primaryLanguage && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              {app.primaryLanguage}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span>{formatNumber(app.stars)}</span>
          </div>
          {app.forks > 0 && (
            <div className="flex items-center gap-1">
              <GitForkIcon className="w-4 h-4" />
              <span>{formatNumber(app.forks)}</span>
            </div>
          )}
          {app.commits > 0 && (
            <div className="flex items-center gap-1">
              <CodeIcon className="w-4 h-4" />
              <span>{formatNumber(app.commits)}</span>
            </div>
          )}
        </div>

        {app.lastCommit && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            最后更新: {format(new Date(app.lastCommit), "yyyy年MM月dd日", { locale: zhCN })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <a
            href={app.website || app.github || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1"
          >
            查看详情 <ArrowUpRight className="w-4 h-4" />
          </a>
        </Button>
        {app.features && app.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {app.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  ))
}

function renderSkeletons(count: number) {
  return Array(count)
    .fill(0)
    .map((_, index) => (
      <Card key={index} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32 mt-3" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    client: "客户端",
    server: "服务端",
    application: "完整应用",
  }
  return typeMap[type] || type
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "待审核",
    approved: "已批准",
    rejected: "已拒绝",
    archived: "已归档",
  }
  return statusMap[status] || status
}
