import { Layers, CheckCircle, GitFork, Users } from "lucide-react"

const stats = [
  {
    icon: <Layers className="h-5 w-5" />,
    value: "12",
    label: "自动化场景",
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    value: "4",
    label: "场景分类",
  },
  {
    icon: <GitFork className="h-5 w-5" />,
    value: "100%",
    label: "可直接落地",
  },
  {
    icon: <Users className="h-5 w-5" />,
    value: "开放",
    label: "社区贡献",
  },
]

export function StatsSection() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 px-6 py-8">
            <div className="text-primary">{stat.icon}</div>
            <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
