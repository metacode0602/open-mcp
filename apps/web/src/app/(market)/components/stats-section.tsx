import { Store, Cpu, Users, BadgeCheck, Bot } from "lucide-react"

const stats = [
  {
    icon: <Store className="h-5 w-5" />,
    value: "6",
    label: "Personas 配置包",
  },
  {
    icon: <Cpu className="h-5 w-5" />,
    value: "10",
    label: "Skills 技能组件",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    value: "7",
    label: "Claw 角色",
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    value: "90%",
    label: "创作者分成",
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
