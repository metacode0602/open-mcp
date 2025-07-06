import { Badge } from "@repo/ui/components/ui/badge"

interface AdStatusBadgeProps {
  status: string
  className?: string
}

export function AdStatusBadge({ status, className }: AdStatusBadgeProps) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className={className}>
          审核中
        </Badge>
      )
    case "active":
      return (
        <Badge variant="default" className={className}>
          投放中
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className={className}>
          已完成
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="destructive" className={className}>
          已拒绝
        </Badge>
      )
    case "paused":
      return (
        <Badge variant="outline" className={className}>
          已暂停
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      )
  }
}

