import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { cn } from "@repo/ui/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type React from "react"

interface AdminStatCardProps {
  title: string
  value: string | number
  change?: number
  increasing?: boolean
  icon?: React.ReactNode
  className?: string
}

export function AdminStatCard({ title, value, change, increasing, icon, className }: AdminStatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof change !== "undefined" && (
          <p
            className={cn(
              "flex items-center text-xs",
              increasing ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {increasing ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
            <span>{change}% 较上月</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

