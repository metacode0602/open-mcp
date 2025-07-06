"use client"

import { Card } from "@repo/ui/components/ui/card"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AdminChartProps {
  period: string
}

export function AdminChart({ period }: AdminChartProps) {
  // 模拟不同时间段的数据
  const data = {
    week: [
      { date: "周一", users: 120, apps: 5, revenue: 12000 },
      { date: "周二", users: 150, apps: 8, revenue: 15000 },
      { date: "周三", users: 180, apps: 10, revenue: 18000 },
      { date: "周四", users: 220, apps: 12, revenue: 22000 },
      { date: "周五", users: 280, apps: 15, revenue: 28000 },
      { date: "周六", users: 250, apps: 13, revenue: 25000 },
      { date: "周日", users: 200, apps: 11, revenue: 20000 },
    ],
    month: [
      { date: "1月", users: 1200, apps: 50, revenue: 120000 },
      { date: "2月", users: 1500, apps: 65, revenue: 150000 },
      { date: "3月", users: 1800, apps: 80, revenue: 180000 },
      { date: "4月", users: 2200, apps: 95, revenue: 220000 },
      { date: "5月", users: 2800, apps: 110, revenue: 280000 },
      { date: "6月", users: 3200, apps: 125, revenue: 320000 },
    ],
    year: [
      { date: "2020", users: 12000, apps: 200, revenue: 1200000 },
      { date: "2021", users: 15000, apps: 250, revenue: 1500000 },
      { date: "2022", users: 18000, apps: 300, revenue: 1800000 },
      { date: "2023", users: 22000, apps: 350, revenue: 2200000 },
      { date: "2024", users: 28000, apps: 400, revenue: 2800000 },
      { date: "2025", users: 32000, apps: 450, revenue: 3200000 },
    ],
  }

  const chartData = data[period as keyof typeof data] || data.week

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={{
              fontSize: "12px",
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            style={{
              fontSize: "12px",
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 border shadow-sm">
                    <div className="text-sm font-medium">{payload[0]?.payload.date}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>用户: {payload[0]?.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>应用: {payload[1]?.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>收入: ¥{payload[2] ? payload[2].value?.toLocaleString() : "0.00"}</span>
                      </div>
                    </div>
                  </Card>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="apps"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

