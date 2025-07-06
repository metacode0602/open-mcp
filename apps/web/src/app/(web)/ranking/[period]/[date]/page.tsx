"use client"

import { getWeeksInMonth, RankingApp } from "@repo/db/types"
import { Button } from "@repo/ui/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { ArrowLeft, Calendar,ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef,useState } from "react"

import RankingAppPage from "@/components/web/rankings/ranking-app"
import { trpc } from "@/lib/trpc/client"

type TimeView = "daily" | "weekly" | "monthly" | "yearly"

// 检查日期是否在将来
const isFutureDate = (year: string, month?: string, day?: string) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(
    parseInt(year),
    month ? parseInt(month) - 1 : 0,
    day ? parseInt(day) : 1
  )
  return targetDate > today
}

export default function RankingPage() {
  const params = useParams()
  const router = useRouter()
  const { period, date } = params as { period: string; date: string }

  // 主要状态管理
  const [activeTab, setActiveTab] = useState<TimeView>((period as TimeView) || "daily")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [title, setTitle] = useState<string>("")

  // tRPC查询
  const { data: products = [], isLoading: loading } = trpc.mcpRankings.getRankingApps.useQuery(
    {
      type: activeTab,
      year: Number(selectedYear),
      month: selectedMonth ? Number(selectedMonth) : undefined,
      day: selectedDate ? Number(selectedDate) : undefined,
    },
    {
      enabled: !!selectedYear && (
        activeTab === 'yearly' ||
        (activeTab === 'monthly' && !!selectedMonth) ||
        (activeTab === 'weekly' && !!selectedMonth && !!selectedWeek) ||
        (activeTab === 'daily' && !!selectedMonth && !!selectedDate)
      )
    }
  )

  // 弹出菜单状态
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false)
  const yearButtonRef = useRef<HTMLButtonElement>(null)

  // 获取月份名称
  const getMonthName = (month: string) => {
    const monthNames = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ]
    return monthNames[Number.parseInt(month) - 1]
  }

  // 获取当月的日期列表
  const getDaysInMonth = useCallback((year: string, month: string) => {
    const daysInMonth = new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"))
  }, [])

  // 获取当月的周列表
  const getWeeksInMonthPage = useCallback((year: string, month: string) => {
    return getWeeksInMonth(year, month);
  }, [])

  // 获取今天的日期
  const getTodayDate = useCallback(() => {
    const today = new Date()
    return {
      year: today.getFullYear().toString(),
      month: (today.getMonth() + 1).toString().padStart(2, "0"),
      day: today.getDate().toString().padStart(2, "0"),
    }
  }, [])

  // 从URL日期初始化状态
  useEffect(() => {
    // 获取今天的日期
    const today = getTodayDate()

    if (date) {
      const [year, month, day] = date.split("-")

      if (year && month) {
        setSelectedYear(year)
        setSelectedMonth(month)
        setExpandedYear(year)

        if (day) {
          setSelectedDate(day)
        } else if (activeTab === "daily") {
          // 如果是日排行但没有指定日期，默认为今天
          setSelectedDate(today.day)
        }

        // 设置当前周
        if (period === "weekly") {
          const targetDate = new Date(Number(year), Number(month) - 1, Number(day || "1"))
          const weeks = getWeeksInMonthPage(year, month)
          // 找到包含目标日期的周
          const currentWeek = weeks.find((week) => {
            return targetDate >= week.startDate && targetDate <= week.endDate
          })
          if (currentWeek) {
            setSelectedWeek(`${currentWeek.start}-${currentWeek.end}`)
          } else if (weeks.length > 0) {
            // 如果没找到对应的周（这种情况不应该发生），默认选择第一周
            const firstWeek = weeks[0]
            if (firstWeek) {
              setSelectedWeek(`${firstWeek.start}-${firstWeek.end}`)
            }
          }
        }
      } else {
        // 如果没有年月信息，设置为今天
        setSelectedYear(today.year)
        setSelectedMonth(today.month)
        setSelectedDate(today.day)
      }
    } else {
      // 如果没有日期参数，设置为今天
      setSelectedYear(today.year)
      setSelectedMonth(today.month)
      setSelectedDate(today.day)
    }
  }, [date, period, getWeeksInMonthPage, getTodayDate, activeTab])

  // 更新标题
  useEffect(() => {
    let newTitle = ""

    if (activeTab === "daily" && selectedDate && selectedMonth && selectedYear) {
      newTitle = `${selectedYear}年${selectedMonth}月${selectedDate}日排行榜`
    } else if (activeTab === "weekly" && selectedWeek && selectedMonth && selectedYear) {
      const weeks = getWeeksInMonthPage(selectedYear, selectedMonth)
      const currentWeekString = selectedWeek
      const currentWeek = weeks.find(week => `${week.start}-${week.end}` === currentWeekString)

      if (currentWeek) {
        // 构建显示格式
        let startDateDisplay = `${currentWeek.startMonth}月${currentWeek.start}日`
        let endDateDisplay = `${currentWeek.endMonth}月${currentWeek.end}日`

        // 如果是跨年的情况
        if (currentWeek.startYear !== currentWeek.endYear) {
          startDateDisplay = `${currentWeek.startYear}年${startDateDisplay}`
          endDateDisplay = `${currentWeek.endYear}年${endDateDisplay}`
          newTitle = `${startDateDisplay}-${endDateDisplay}周排行榜`
        }
        // 如果是跨月但同年的情况
        else if (currentWeek.startMonth !== currentWeek.endMonth) {
          newTitle = `${currentWeek.startYear}年${startDateDisplay}-${endDateDisplay}周排行榜`
        }
        // 如果是同月的情况
        else {
          newTitle = `${currentWeek.startYear}年${currentWeek.startMonth}月${currentWeek.start}日-${currentWeek.end}日周排行榜`
        }
      }
    } else if (activeTab === "monthly" && selectedMonth && selectedYear) {
      newTitle = `${selectedYear}年${getMonthName(selectedMonth)}排行榜`
    } else if (activeTab === "yearly" && selectedYear) {
      newTitle = `${selectedYear}年度排行榜`
    } else {
      newTitle = "产品排行榜"
    }

    setTitle(newTitle)
  }, [activeTab, selectedDate, selectedWeek, selectedMonth, selectedYear])

  // 处理标签切换
  const handleTabChange = (tab: TimeView) => {
    setActiveTab(tab)

    // 如果切换到日排行且没有选择日期，设置为今天
    if (tab === "daily" && !selectedDate) {
      const today = getTodayDate()
      setSelectedDate(today.day)
    }

    // 更新URL
    let newPath = `/ranking/${tab}/${selectedYear}-${selectedMonth}`
    if (tab === "daily") {
      newPath += `-${selectedDate || getTodayDate().day}`
    }

    router.push(newPath)
  }

  // 处理年份切换
  const handleYearClick = (year: string) => {
    // 检查是否是未来年份
    if (isFutureDate(year)) {
      return
    }
    setSelectedYear(year)
    setExpandedYear(year)
  }

  // 处理月份切换
  const handleMonthClick = (month: string) => {
    // 检查是否是未来月份
    if (isFutureDate(selectedYear, month)) {
      return
    }

    setSelectedMonth(month)
    setIsYearMenuOpen(false)

    // 更新URL，但保持当前的排行类型不变
    let newPath = `/ranking/${activeTab}/${selectedYear}-${month}`
    if (activeTab === "daily") {
      // 如果是日排行，默认选择该月第一天
      const days = getDaysInMonth(selectedYear, month)
      const newDate = days[0]
      setSelectedDate(newDate as string)
      newPath += `-${newDate}`
    }

    router.push(newPath)
  }

  // 处理日期导航
  const handleDateNavigation = (direction: "prev" | "next") => {
    if (activeTab === "daily") {
      const days = getDaysInMonth(selectedYear, selectedMonth)
      const currentIndex = days.indexOf(selectedDate)

      if (direction === "prev" && currentIndex > 0) {
        const newDate = days[currentIndex - 1]
        if (newDate) {
          setSelectedDate(newDate)
          router.push(`/ranking/daily/${selectedYear}-${selectedMonth}-${newDate}`)
        }
      } else if (direction === "next" && currentIndex < days.length - 1) {
        const newDate = days[currentIndex + 1]
        if (newDate) {
          setSelectedDate(newDate)
          router.push(`/ranking/daily/${selectedYear}-${selectedMonth}-${newDate}`)
        }
      }
    } else if (activeTab === "weekly") {
      const weeks = getWeeksInMonthPage(selectedYear, selectedMonth)
      const currentWeekString = selectedWeek
      const currentIndex = weeks.findIndex(week => `${week.start}-${week.end}` === currentWeekString)

      if (direction === "prev") {
        if (currentIndex > 0) {
          // 还在当前月份内
          const prevWeek = weeks[currentIndex - 1]
          if (prevWeek) {
            setSelectedWeek(`${prevWeek.start}-${prevWeek.end}`)
            router.push(`/ranking/weekly/${prevWeek.startYear}-${prevWeek.startMonth.toString().padStart(2, "0")}-${prevWeek.start}`)
          }
        } else {
          // 需要切换到上个月的最后一周
          const prevMonthDate = new Date(Number(selectedYear), Number(selectedMonth) - 2, 1) // -2是因为月份从0开始
          const prevYear = prevMonthDate.getFullYear().toString()
          const prevMonth = (prevMonthDate.getMonth() + 1).toString().padStart(2, "0")
          const prevMonthWeeks = getWeeksInMonthPage(prevYear, prevMonth)

          if (prevMonthWeeks.length > 0) {
            const lastWeek = prevMonthWeeks[prevMonthWeeks.length - 1]
            if (lastWeek) {
              setSelectedYear(prevYear)
              setSelectedMonth(prevMonth)
              setSelectedWeek(`${lastWeek.start}-${lastWeek.end}`)
              router.push(`/ranking/weekly/${prevYear}-${prevMonth}-${lastWeek.start}`)
            }
          }
        }
      } else if (direction === "next") {
        if (currentIndex < weeks.length - 1) {
          // 还在当前月份内
          const nextWeek = weeks[currentIndex + 1]
          if (nextWeek) {
            setSelectedWeek(`${nextWeek.start}-${nextWeek.end}`)
            router.push(`/ranking/weekly/${nextWeek.startYear}-${nextWeek.startMonth.toString().padStart(2, "0")}-${nextWeek.start}`)
          }
        } else {
          // 需要切换到下个月的第一周
          const nextMonthDate = new Date(Number(selectedYear), Number(selectedMonth), 1)
          const nextYear = nextMonthDate.getFullYear().toString()
          const nextMonth = (nextMonthDate.getMonth() + 1).toString().padStart(2, "0")
          const nextMonthWeeks = getWeeksInMonthPage(nextYear, nextMonth)
          console.info("nextMonthWeeks", nextMonthWeeks, nextMonthDate, nextYear, nextMonth)
          if (nextMonthWeeks.length > 0) {
            const firstWeek = nextMonthWeeks[0]
            console.info("next week: firstWeek", firstWeek)
            if (firstWeek) {
              setSelectedYear(nextYear)
              setSelectedMonth(nextMonth)
              setSelectedWeek(`${firstWeek.start}-${firstWeek.end}`)
              router.push(`/ranking/weekly/${firstWeek.endYear}-${firstWeek.endMonth}-${firstWeek.end}`)
            }
          }
        }
      }
    }
  }

  // 处理日期选择
  const handleDateSelect = (day: string) => {
    // 检查是否是未来日期
    if (isFutureDate(selectedYear, selectedMonth, day)) {
      return
    }

    setSelectedDate(day)
    router.push(`/ranking/daily/${selectedYear}-${selectedMonth}-${day}`)
  }

  // 处理周选择
  const handleWeekSelect = (week: { start: string; end: string; display: string; startMonth: number; endMonth: number; startYear: number; endYear: number }) => {
    setSelectedWeek(`${week.start}-${week.end}`)
    // 使用开始日期的年月作为导航
    router.push(`/ranking/weekly/${week.startYear}-${week.startMonth.toString().padStart(2, "0")}-${week.start}`)
  }

  // 获取倒序排列的月份
  const getMonthsInReverseOrder = () => {
    return Array.from({ length: 12 }, (_, i) => (12 - i).toString().padStart(2, "0"))
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 返回按钮和标题 */}
      <div className="flex flex-col md:flex-row md:justify-between items-center gap-2 mb-6">
        <div className="flex flex-row items-center gap-2">
          <Link href="/ranking">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">返回首页</span>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        {/* 时间视图切换按钮 */}
        <div className="flex items-center gap-4">
          <Button
            variant={activeTab === "daily" ? "default" : "outline"}
            onClick={() => handleTabChange("daily")}
            className="transition-all"
          >
            每日
          </Button>
          <Button
            variant={activeTab === "weekly" ? "default" : "outline"}
            onClick={() => handleTabChange("weekly")}
            className="transition-all"
          >
            每周
          </Button>
          <Button
            variant={activeTab === "monthly" ? "default" : "outline"}
            onClick={() => handleTabChange("monthly")}
            className="transition-all"
          >
            每月
          </Button>
          <Button
            variant={activeTab === "yearly" ? "default" : "outline"}
            onClick={() => handleTabChange("yearly")}
            className="transition-all"
          >
            每年
          </Button>

          {/* 年份月份选择弹出菜单 */}
          <Popover open={isYearMenuOpen} onOpenChange={setIsYearMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={yearButtonRef}
                variant="outline"
                onClick={() => setIsYearMenuOpen(true)}
                className="transition-all flex items-center gap-2"
              >
                <span>选择月份</span>
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="grid grid-cols-2 gap-0">
                {/* 年份列表 - 只显示2024-2025 */}
                <div className="border-r">
                  <div className="p-2 font-medium text-sm bg-gray-50">选择年份</div>
                  <div className="p-1">
                    {["2025", "2024"].map((year) => (
                      <div
                        key={year}
                        className={`cursor-pointer p-2 rounded-md text-sm ${selectedYear === year ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                          }`}
                        onClick={() => handleYearClick(year)}
                      >
                        {year}年
                      </div>
                    ))}
                  </div>
                </div>

                {/* 月份列表（倒序） */}
                <div>
                  <div className="p-2 font-medium text-sm bg-gray-50">选择月份</div>
                  <div className="p-1">
                    {getMonthsInReverseOrder().map((month) => (
                      <div
                        key={month}
                        className={`cursor-pointer p-2 rounded-md text-sm ${selectedYear === expandedYear && selectedMonth === month
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-gray-100"
                          }`}
                        onClick={() => handleMonthClick(month)}
                      >
                        {getMonthName(month)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 主体内容：左右两列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6">
        {/* 左列：排行数据 */}
        <div className="space-y-6">
          {/* 日期导航 - 每日视图 - 一行显示所有日期，不滚动 */}
          {activeTab === "daily" && selectedYear && selectedMonth && (
            <div className="flex items-center gap-1 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateNavigation("prev")}
                disabled={selectedDate === getDaysInMonth(selectedYear, selectedMonth)[0]}
                className="shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">上一天</span>
              </Button>

              <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 lg:grid-cols-31 gap-1 py-1 w-full">
                {getDaysInMonth(selectedYear, selectedMonth).map((day) => (
                  <Button
                    key={day}
                    variant={selectedDate === day ? "secondary" : "ghost"}
                    size="sm"
                    disabled={isFutureDate(selectedYear, selectedMonth, day)}
                    className={`min-w-[32px] rounded-full ${selectedDate === day ? "bg-gray-100 text-primary" : ""}`}
                    onClick={() => handleDateSelect(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDateNavigation("next")}
                disabled={isFutureDate(selectedYear, selectedMonth, (parseInt(selectedDate) + 1).toString())}
                className="shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">下一天</span>
              </Button>
            </div>
          )}

          {/* 周导航 - 每周视图 */}
          {activeTab === "weekly" && selectedYear && selectedMonth && (
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              <Button variant="ghost" size="icon" onClick={() => handleDateNavigation("prev")} className="shrink-0">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">上一周</span>
              </Button>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                {getWeeksInMonthPage(selectedYear, selectedMonth).map((week, index) => (
                  <Button
                    key={index}
                    disabled={isFutureDate(week.startYear.toString(), week.startMonth.toString(), week.start)}
                    variant={selectedWeek === `${week.start}-${week.end}` ? "secondary" : "ghost"}
                    size="sm"
                    className={`whitespace-nowrap ${selectedWeek === `${week.start}-${week.end}` ? "bg-gray-100 text-primary" : ""
                      }`}
                    onClick={() => handleWeekSelect(week)}
                  >
                    {week.display}
                  </Button>
                ))}
              </div>

              <Button variant="ghost" size="icon" onClick={() => handleDateNavigation("next")} className="shrink-0" disabled={isFutureDate(selectedYear, selectedMonth, (parseInt(selectedDate) + 7).toString())}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">下一周</span>
              </Button>
            </div>
          )}

          {/* 产品列表 */}
          <div className="space-y-4">
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : products.length === 0 ? (
              // 空数据状态
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Calendar className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-medium">暂无数据</h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === "daily" && "该日期暂无排行数据"}
                    {activeTab === "weekly" && "该周暂无排行数据"}
                    {activeTab === "monthly" && "该月暂无排行数据"}
                    {activeTab === "yearly" && "该年暂无排行数据"}
                  </p>
                </div>
              </div>
            ) : (
              // 产品列表
              products.map((product: RankingApp, index) => (
                <RankingAppPage key={product.id} app={product} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
