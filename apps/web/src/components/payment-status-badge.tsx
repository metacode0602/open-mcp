import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"

type PaymentStatus = "pending" | "completed" | "failed" | "refunded"

interface PaymentStatusBadgeProps {
  status: PaymentStatus
}

const statusConfig = {
  pending: {
    label: "处理中",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  completed: {
    label: "已完成",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  failed: {
    label: "失败",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  refunded: {
    label: "已退款",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
} as const

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}

