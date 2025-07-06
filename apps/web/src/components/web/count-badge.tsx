"use client"

import { formatNumber } from "@/lib/utils"
import plur from "plur"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import { Ping } from "@/components/web/ping"
import { trpc } from "@/lib/trpc/client"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

interface CountBadgeProps {
  className?: string
}

const CountBadge = ({ className }: CountBadgeProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const { data, isLoading, isError } = trpc.mcpApps.getCountBadge.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
  })

  // Fade in animation when data loads
  useEffect(() => {
    if (!isLoading && !isError) {
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isError])

  if (isError) {
    return null // Hide badge on error for graceful degradation
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading ? (
        <CountBadgeSkeleton />
      ) : (
        <Badge
          className={cn(
            "transition-all duration-300 ease-in-out transform",
            "px-3 py-1 h-auto text-sm font-medium",
            "hover:bg-primary hover:text-primary-foreground",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
          )}
        >
          <Link href="/latest" className="flex items-center gap-1.5">
            {data?.newCount ? (
              <>
                <Ping className="mr-0.5" />
                <span>
                  新增 <span className="font-semibold">{formatNumber(data.newCount)}</span>{" "}
                  {plur("工具", data.newCount)}
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold">{formatNumber(data?.count ?? 0)}+</span> 开源应用
              </>
            )}
          </Link>
        </Badge>
      )}
    </div>
  )
}

const CountBadgeSkeleton = () => {
  return (
    <Badge className="min-w-24 order-first pointer-events-none overflow-hidden relative px-3 py-1 h-auto">
      <div className="flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin opacity-70" />
        <span className="opacity-70">加载中</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </Badge>
  )
}

export { CountBadge, CountBadgeSkeleton }
