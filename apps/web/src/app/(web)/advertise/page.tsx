"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { ArrowRight, CreditCard, Eye, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { PaymentDialog } from "@/components/payment-dialog"
import { Container } from "@/components/web/container"
import { PageHeader } from "@/components/web/page-header"
import { Section } from "@/components/web/section"
import { WechatQRCodeDialog } from "@/components/wechat-qrcode-dialog"
import { trpc } from "@/lib/trpc/client"

export default function AdvertisePage() {
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [selectedAdType, setSelectedAdType] = useState<string>("listing")
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)

  const { data: adPricing, isLoading: isPriceLoading } = trpc.mcpAds.getAdPricing.useQuery()

  // Generate calendar months starting from current date
  const currentDate = new Date()
  const months = Array.from({ length: 2 }).map((_, index) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + index + currentMonthOffset, 1)
    return {
      name: date.toLocaleString('zh-CN', { month: 'long' }),
      year: date.getFullYear(),
      days: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
      month: date.getMonth(),
      firstDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay() || 7, // Convert Sunday (0) to 7
    }
  })

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonthOffset(prev => prev - 1)
  }

  const handleNextMonth = () => {
    setCurrentMonthOffset(prev => prev + 1)
  }

  // Handle date selection
  const handleDateClick = (dateString: string) => {
    const clickedDate = new Date(dateString)

    // Don't allow selecting dates in the past
    if (clickedDate < new Date(currentDate.setHours(0, 0, 0, 0))) {
      return
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(dateString)
      setEndDate(null)
    } else {
      // Complete the selection
      const start = new Date(startDate)
      if (clickedDate < start) {
        setStartDate(dateString)
        setEndDate(startDate)
      } else {
        setEndDate(dateString)
      }
    }
  }

  // Get all selected dates between start and end
  const getSelectedDates = () => {
    if (!startDate) return []
    if (!endDate) return [startDate]

    const dates: string[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(date.toISOString().split('T')[0] || '')
    }

    return dates
  }

  const selectedDates = getSelectedDates()

  // Calculate total price
  const calculateTotal = () => {
    if (!adPricing) return 0
    return selectedDates.length * (selectedAdType === "listing" ? adPricing.listingAdPrice : adPricing.bannerAdPrice)
  }

  // Handle purchase button click
  const handlePurchase = () => {
    if (!startDate || !endDate) {
      alert("请选择起始和结束日期")
      return
    }
    setIsPaymentDialogOpen(true)
  }

  // Helper function to check if a date is selected
  const isDateSelected = (dateString: string) => {
    if (!startDate) return false
    if (!endDate) return dateString === startDate

    const date = new Date(dateString)
    const start = new Date(startDate)
    const end = new Date(endDate)

    return date >= start && date <= end
  }

  // Helper function to check if a date is in the past
  const isDateInPast = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date(currentDate.setHours(0, 0, 0, 0))
    return date < today
  }

  if (isPriceLoading) {
    return (
      <div className="min-h-screen">
        <Container className="py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mx-auto mb-6" />
            <div className="h-24 bg-muted rounded max-w-3xl mx-auto" />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Container className="py-10">
        <PageHeader
          title="在 OpenMCP 上推广"
          align="center"
          className="mb-6"
        />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-muted-foreground">
            通过在 OpenMCP 平台上推广您的业务或软件，接触到广泛的开源爱好者和开发者。 查看我们的
            <Link href="#statistics" className="text-primary underline underline-offset-4">
              实时统计数据
            </Link>
            ，了解推广可能带来的影响。
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => setIsContactDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              联系我们
            </Button>
            <Button variant="outline" asChild>
              <Link href="#ad-options">
                查看推广选项
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div id="ad-options" className="mb-16">
          <Tabs defaultValue="listing" onValueChange={setSelectedAdType} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="listing">列表广告</TabsTrigger>
              <TabsTrigger value="banner">横幅广告</TabsTrigger>
            </TabsList>

            <TabsContent value="listing">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>列表广告</CardTitle>
                      <CardDescription>在每个工具列表页面上可见</CardDescription>
                    </div>
                    <Badge className="text-base px-3 py-1">
                      ¥{adPricing?.listingAdPrice || '-'} / 天
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Eye className="h-4 w-4" />
                    <span>在所有工具列表页面上可见</span>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-2">广告位特点</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>高曝光率 - 每日超过 10,000 次展示</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>精准定位 - 接触对开源技术感兴趣的开发者</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>包含链接和简短描述</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">选择日期</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {months.map((month, monthIndex) => (
                        <div key={monthIndex} className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 p-3 flex items-center justify-between">
                            <div className="text-center font-medium flex-1">
                              {month.name} {month.year}
                            </div>
                            {monthIndex === 1 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handlePrevMonth}
                                  className="p-1 rounded-md hover:bg-muted"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                  </svg>
                                </button>
                                <button
                                  onClick={handleNextMonth}
                                  className="p-1 rounded-md hover:bg-muted"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                              <div>一</div>
                              <div>二</div>
                              <div>三</div>
                              <div>四</div>
                              <div>五</div>
                              <div>六</div>
                              <div>日</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: month.firstDay - 1 }).map((_, index) => (
                                <div key={index} />
                              ))}
                              {Array.from({ length: month.days }).map((_, dayIndex) => {
                                const day = dayIndex + 1
                                const dateString = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const isSelected = isDateSelected(dateString)
                                const isPast = isDateInPast(dateString)

                                return (
                                  <button
                                    key={day}
                                    className={`h-8 w-8 rounded-md flex items-center justify-center text-sm ${isSelected ? "bg-primary text-primary-foreground" : isPast ? "text-muted" : "hover:bg-muted"
                                      }`}
                                    onClick={() => handleDateClick(dateString)}
                                    disabled={isPast}
                                  >
                                    {day}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm">
                    已选择 <span className="font-medium">{selectedDates.length}</span> 天
                    {selectedDates.length > 0 && (
                      <span className="ml-1">
                        (总计: <span className="font-medium">¥{calculateTotal()}</span>)
                      </span>
                    )}
                  </div>
                  <Button onClick={handlePurchase}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    立即推广
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="banner">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>横幅广告</CardTitle>
                      <CardDescription>在网站的每个页面上可见</CardDescription>
                    </div>
                    <Badge className="text-base px-3 py-1">
                      ¥{adPricing?.bannerAdPrice || '-'} / 天
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Eye className="h-4 w-4" />
                    <span>在网站的所有页面上可见</span>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-2">广告位特点</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>最大曝光率 - 每日超过 25,000 次展示</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>全站可见 - 在所有页面顶部展示</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>包含图片、链接和详细描述</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">选择日期</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {months.map((month, monthIndex) => (
                        <div key={monthIndex} className="border rounded-lg overflow-hidden">
                          <div className="bg-muted/30 p-3 flex items-center justify-between">
                            <div className="text-center font-medium flex-1">
                              {month.name} {month.year}
                            </div>
                            {monthIndex === 1 && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handlePrevMonth}
                                  className="p-1 rounded-md hover:bg-muted"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                  </svg>
                                </button>
                                <button
                                  onClick={handleNextMonth}
                                  className="p-1 rounded-md hover:bg-muted"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                              <div>一</div>
                              <div>二</div>
                              <div>三</div>
                              <div>四</div>
                              <div>五</div>
                              <div>六</div>
                              <div>日</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: month.firstDay - 1 }).map((_, index) => (
                                <div key={index} />
                              ))}
                              {Array.from({ length: month.days }).map((_, dayIndex) => {
                                const day = dayIndex + 1
                                const dateString = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const isSelected = isDateSelected(dateString)
                                const isPast = isDateInPast(dateString)

                                return (
                                  <button
                                    key={day}
                                    className={`h-8 w-8 rounded-md flex items-center justify-center text-sm ${isSelected ? "bg-primary text-primary-foreground" : isPast ? "text-muted" : "hover:bg-muted"
                                      }`}
                                    onClick={() => handleDateClick(dateString)}
                                    disabled={isPast}
                                  >
                                    {day}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm">
                    已选择 <span className="font-medium">{selectedDates.length}</span> 天
                    {selectedDates.length > 0 && (
                      <span className="ml-1">
                        (总计: <span className="font-medium">¥{calculateTotal()}</span>)
                      </span>
                    )}
                  </div>
                  <Button onClick={handlePurchase}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    立即购买
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Section id="statistics" background="muted" className="rounded-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">平台数据</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              OpenMCP 是一个快速增长的平台，拥有大量活跃用户和高质量的流量
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">275K+</div>
                  <p className="text-muted-foreground">月访问量</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">350+</div>
                  <p className="text-muted-foreground">已收录应用</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">3K+</div>
                  <p className="text-muted-foreground">订阅用户</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">4.2K+</div>
                  <p className="text-muted-foreground">GitHub Stars</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section className="max-w-3xl mx-auto">
          <div className="bg-muted/30 rounded-xl p-8 text-center">
            <div className="mb-6">
              <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium mb-2">
                客户反馈
              </span>
              <h3 className="text-2xl font-bold">客户对我们的评价</h3>
            </div>

            <blockquote className="text-lg italic mb-6">
              "OpenMCP 一直是我们网站流量的重要来源。特别是首页广告位，为我们带来了显著的 10-20% 的流量增长。
              平台的用户质量很高，转化率远超我们的预期。强烈推荐！"
            </blockquote>

            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-muted overflow-hidden mr-3">
                <Image
                  src="/placeholder.svg?height=48&width=48"
                  alt="客户头像"
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <div className="font-medium">张明</div>
                <div className="text-sm text-muted-foreground">某开源项目创始人</div>
              </div>
            </div>
          </div>
        </Section>

        <Section className="text-center">
          <h2 className="text-3xl font-bold mb-4">准备好推广您的应用了吗？</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            选择适合您的广告方案，提高您的应用在开发者社区中的知名度
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setIsContactDialogOpen(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              联系我们
            </Button>
            <Button variant="outline" onClick={handlePurchase}>
              <CreditCard className="mr-2 h-4 w-4" />
              立即购买
            </Button>
          </div>
        </Section>
      </Container>

      {/* 微信二维码对话框 */}
      <WechatQRCodeDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />

      {/* 支付对话框 */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        amount={calculateTotal()}
        adType={selectedAdType === "listing" ? "列表广告" : "横幅广告"}
        days={selectedDates.length}
      />
    </div>
  )
}

