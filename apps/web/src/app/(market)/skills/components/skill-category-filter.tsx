"use client"

import { Database, Brain, Plug, FileOutput, Wrench, LayoutGrid } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

const icons: Record<string, React.ReactNode> = {
  Database: <Database className="h-4 w-4" />,
  Brain: <Brain className="h-4 w-4" />,
  Plug: <Plug className="h-4 w-4" />,
  FileOutput: <FileOutput className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
}

interface SkillCategoryFilterProps {
  categories: Record<string, { label: string; icon: string; description?: string }>
  selected: string | "all"
  onSelect: (category: string | "all") => void
  counts: Record<string, number>
}

export function SkillCategoryFilter({ categories, selected, onSelect, counts }: SkillCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
          selected === "all"
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span>全部</span>
        <span className="ml-1 rounded-md bg-background px-1.5 py-0.5 text-xs">{counts.all}</span>
      </button>

      {Object.entries(categories).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
              selected === key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {icons[icon]}
            <span>{label}</span>
            <span className="ml-1 rounded-md bg-background px-1.5 py-0.5 text-xs">
              {counts[key] || 0}
            </span>
          </button>
        ))}
    </div>
  )
}
