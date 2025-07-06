"use client"

import { Button } from "@repo/ui/components/ui/button"
import { cn } from "@repo/ui/lib/utils"

interface LoadMoreButtonProps {
  onClick: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  label?: string
  loadingLabel?: string
}

export function LoadMoreButton({
  onClick,
  className,
  disabled = false,
  loading = false,
  label = "加载更多",
  loadingLabel = "加载中...",
}: LoadMoreButtonProps) {
  return (
    <div className={cn("flex justify-center mt-8", className)}>
      <Button variant="outline" onClick={onClick} disabled={disabled || loading}>
        {loading ? loadingLabel : label}
      </Button>
    </div>
  )
}

