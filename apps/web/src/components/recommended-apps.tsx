"use client"

import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { trpc } from "@/lib/trpc/client"
import { McpApp } from "@repo/db/types"
import { getAssetUrl } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface RecommendedAppsProps {
  currentApp: McpApp
  limit?: number
}

const useCarousel = (items: any[], itemsPerPage: number) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalPages = Math.ceil(items.length / itemsPerPage)

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }, [totalPages])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }, [totalPages])

  const visibleItems = items.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return {
    currentIndex,
    totalPages,
    handlePrevious,
    handleNext,
    visibleItems,
  }
}

const LoadingSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse"
      >
        <div className="h-32 bg-muted rounded-lg" />
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>
      </motion.div>
    ))}
  </div>
)

const ErrorState = () => (
  <div className="text-center text-muted-foreground">
    加载推荐应用时出现错误，请稍后再试
  </div>
)

export function RecommendedApps({ currentApp, limit = 6 }: RecommendedAppsProps) {
  const { data: recommendedApps = [], isLoading, error } = trpc.mcpRecommendations.getAppRecommendedApps.useQuery({
    limit,
    appId: currentApp.id,
  })

  const { currentIndex, totalPages, handlePrevious, handleNext, visibleItems } = useCarousel(recommendedApps, 3)

  if (isLoading) {
    return (
      <Card className="mt-8 overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>推荐应用</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8 overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle>推荐应用</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ErrorState />
        </CardContent>
      </Card>
    )
  }

  if (recommendedApps.length === 0) {
    return null
  }

  return (
    <Card className="mt-8 overflow-hidden">
      <CardHeader>
        <CardTitle>推荐应用</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {visibleItems.map((app) => (
              <Link key={app.slug} href={`/apps/${app.slug}`} className="group block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative overflow-hidden rounded-lg border transition-all group-hover:shadow-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
                  <div className="h-32 bg-muted">
                    {app.icon ? (
                      <Image
                        src={getAssetUrl(app.icon) || "/placeholder.svg"}
                        alt={app.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/30">
                        <span className="text-4xl font-bold text-primary/70">{app.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative z-20 p-4 -mt-8">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={app.type === "client" ? "default" : app.type === "server" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {app.type === "client" ? "客户端" : app.type === "server" ? "服务器" : "应用"}
                      </Badge>
                    </div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{app.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{app.description}</p>
                    <div className="flex items-center justify-end mt-2 text-xs text-primary font-medium">
                      查看详情
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

