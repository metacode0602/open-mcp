import { Badge } from "@repo/ui/components/ui/badge"
import { AlertCircle, BarChart, CheckCircle, Clock, CreditCard, Lightbulb, Package, Shield } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: string
  user: string
  link: string
}

interface AdminRecentActivityProps {
  activities: Activity[]
}

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
  // 获取活动类型图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "app_submission":
        return <Package className="h-4 w-4" />
      case "claim":
        return <Shield className="h-4 w-4" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />
      case "ad_purchase":
        return <BarChart className="h-4 w-4" />
      case "payment":
        return <CreditCard className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // 获取活动状态徽章
  const getActivityStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            已完成
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
          >
            <Clock className="mr-1 h-3 w-3" />
            待处理
          </Badge>
        )
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            已拒绝
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="font-medium truncate">{activity.title}</div>
              {getActivityStatusBadge(activity.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {activity.timestamp} • {activity.user}
              </span>
              <Link href={activity.link} className="text-primary hover:underline">
                查看详情
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

