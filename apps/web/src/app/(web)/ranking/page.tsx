'use client'

import { RankingApp } from "@repo/db/types"
import { Button } from "@repo/ui/components/ui/button"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

import RankingAppPage from "@/components/web/rankings/ranking-app"
import { trpc } from "@/lib/trpc/client"

// 获取当前日期格式化为 YYYY-MM-DD
function getFormattedDate(daysAgo = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0] ?? ""
}

export default function HomePage() {
  const today = getFormattedDate()
  const yesterday = getFormattedDate(1)
  const lastMonthDate = getFormattedDate(30)

  // Fetch data using tRPC
  const { data: todayProducts, isLoading: todayLoading } = trpc.mcpRankings.getTodayRankingApps.useQuery()
  const { data: yesterdayProducts, isLoading: yesterdayLoading } = trpc.mcpRankings.getYesterdayRankingApps.useQuery()
  const { data: lastWeekProducts, isLoading: weeklyLoading } = trpc.mcpRankings.getWeeklyRankingApps.useQuery()
  const { data: lastMonthProducts, isLoading: monthlyLoading } = trpc.mcpRankings.getMonthlyRankingApps.useQuery()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">产品排行榜</h1>
      {/* 今日排行 */}
      <RankingSection
        title="今日排行"
        products={todayProducts}
        isLoading={todayLoading}
        viewAllLink={`/ranking/daily/${today}`}
      />

      {/* 昨日排行 */}
      <RankingSection
        title="昨日排行"
        products={yesterdayProducts}
        isLoading={yesterdayLoading}
        viewAllLink={`/ranking/daily/${yesterday}`}
      />

      {/* 上周排行 */}
      <RankingSection
        title="上周排行"
        products={lastWeekProducts}
        isLoading={weeklyLoading}
        viewAllLink={`/ranking/weekly/${today}`}
      />

      {/* 上月排行 */}
      <RankingSection
        title="上月排行"
        products={lastMonthProducts}
        isLoading={monthlyLoading}
        viewAllLink={`/ranking/monthly/${lastMonthDate}`}
      />
    </div>
  )
}

interface RankingSectionProps {
  title: string
  products?: RankingApp[]
  isLoading: boolean
  viewAllLink: string
}

function RankingSection({ title, products, isLoading, viewAllLink }: RankingSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Link href={viewAllLink}>
          <Button variant="ghost" className="flex items-center gap-1 text-primary">
            查看全部 <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))
        ) : products?.length ? (
          products.map((product, index) => (
            <RankingAppPage key={product.id} app={product} index={index} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无排行数据
          </div>
        )}
      </div>
    </section>
  )
}
