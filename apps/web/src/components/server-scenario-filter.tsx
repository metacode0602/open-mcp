"use client"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import { cn } from "@repo/ui/lib/utils"
import { Database, FileText, Globe, MessageSquare, Table2 } from "lucide-react"

interface ServerScenarioFilterProps {
  selectedScenario: string | null
  onSelectScenario: (scenario: string | null) => void
}

interface ServerScenario {
  id: string
  name: string
  description: string
  icon: React.ElementType
}

const serverScenarios: ServerScenario[] = [
  {
    id: "database",
    name: "数据库",
    description: "使用自然语言管理和查询数据库",
    icon: Database,
  },
  {
    id: "content",
    name: "内容管理",
    description: "管理和生成各种内容和文档",
    icon: FileText,
  },
  {
    id: "web",
    name: "Web服务",
    description: "提供Web API和服务",
    icon: Globe,
  },
  {
    id: "chat",
    name: "对话服务",
    description: "提供对话和聊天功能",
    icon: MessageSquare,
  },
  {
    id: "analytics",
    name: "数据分析",
    description: "分析和可视化数据",
    icon: Table2,
  },
];

export function ServerScenarioFilter({ selectedScenario, onSelectScenario }: ServerScenarioFilterProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4">应用场景</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            !selectedScenario && "border-primary bg-primary/5",
          )}
          onClick={() => onSelectScenario(null)}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <span className="text-lg font-bold">全部</span>
            </div>
            <span className="text-sm font-medium">所有服务器</span>
            <p className="text-xs text-muted-foreground mt-1">显示所有MCP服务器</p>
          </CardContent>
        </Card>

        {serverScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedScenario === scenario.id && "border-primary bg-primary/5",
            )}
            onClick={() => onSelectScenario(scenario.id)}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                <scenario.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{scenario.name}</span>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scenario.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

