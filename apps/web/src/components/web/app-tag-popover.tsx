import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover"
import { cn } from "@repo/ui/lib/utils"
import { AlertCircleIcon, RefreshCwIcon, StarIcon, TagIcon, UsersIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useRef, useState } from "react"

import { trpc } from "@/lib/trpc/client"
import { formatNumber } from "@/lib/utils"

// 骨架屏组件
const AppSkeleton = () => (
  <div className="flex items-center gap-3 rounded-lg p-2 animate-pulse">
    <div className="h-8 w-8 rounded bg-muted" />
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-12 bg-muted rounded" />
      </div>
      <div className="h-3 w-32 bg-muted rounded" />
      <div className="flex items-center gap-3">
        <div className="h-3 w-8 bg-muted rounded" />
        <div className="h-3 w-12 bg-muted rounded" />
      </div>
    </div>
  </div>
)

// 错误状态组件
const ErrorState = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <AlertCircleIcon className="h-8 w-8 text-destructive mb-2" />
    <p className="text-sm text-muted-foreground mb-3">
      {error.message || "加载失败，请稍后重试"}
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="flex items-center gap-1"
    >
      <RefreshCwIcon className="h-3 w-3" />
      重试
    </Button>
  </div>
)

// 空状态组件
const EmptyState = ({ tag }: { tag: string }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <TagIcon className="h-8 w-8 text-muted-foreground mb-2" />
    <p className="text-sm text-muted-foreground">
      暂无其他使用 "{tag}" 标签的应用
    </p>
  </div>
)

export const AppTagWithPopover = ({ tag }: { tag: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const path = usePathname().split("/").pop();

  const {
    data: relatedApps,
    isLoading,
    error,
    refetch,
    isFetching,
  } = trpc.mcpApps.getByTag.useQuery({ tagName: tag, appSlug: path, limit: 5 }, {
    enabled: isOpen, // 只在弹窗打开时获取数据
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2,
    retryDelay: 1000,
  });

  // 处理鼠标事件
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(true)
    setIsOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    // 延迟关闭，给用户时间移动到弹窗内容
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsOpen(false)
      }
    }, 150)
  }, [])

  // 清理定时器
  const handlePopoverOpenChange = useCallback((open: boolean) => {
    if (!open && timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(open)
  }, [])

  // 处理重试
  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // 渲染内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <AppSkeleton key={index} />
          ))}
        </div>
      )
    }

    if (error) {
      return <ErrorState error={error as unknown as Error} onRetry={handleRetry} />
    }

    if (!relatedApps || relatedApps.length === 0) {
      return <EmptyState tag={tag} />
    }

    return (
      <div className="space-y-2">
        {relatedApps.map((app) => (
          <div
            key={app.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <Link href={`/apps/${app.slug}`} className="flex items-center gap-3 w-full">
              <img
                src={app.icon || "/placeholder.svg?height=32&width=32"}
                alt={app.name}
                className="h-8 w-8 rounded object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=32&width=32"
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{app.name}</span>
                  {app.primaryLanguage && (
                    <Badge variant="outline" className="text-xs">
                      {app.primaryLanguage}
                    </Badge>
                  )}
                </div>
                {(app.descriptionZh || app.description) && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{app.descriptionZh || app.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <StarIcon className="h-3 w-3" />
                    {formatNumber(app.stars || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UsersIcon className="h-3 w-3" />
                    {formatNumber(app.contributors || 0)}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className={cn(
            "cursor-pointer transition-all duration-200 hover:bg-primary hover:text-primary-foreground",
            isFetching && "animate-pulse"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <TagIcon className="mr-1 h-3 w-3" />
          {tag}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        side="bottom"
        align="start"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">标签: {tag}</span>
            {!isLoading && !error && (
              <Badge variant="outline" className="text-xs">
                {relatedApps?.length || 0} 个应用
              </Badge>
            )}
            {isFetching && (
              <RefreshCwIcon className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          {renderContent()}

          {!isLoading && !error && relatedApps && relatedApps.length > 0 && (
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">点击应用查看详细信息</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
