"use client"

import { Users, Sparkles, Zap, BookOpen, LayoutGrid, Crown, Code, Megaphone, Headphones, Settings } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import type { PersonaCategory } from "@/lib/types/personas"

const icons: Record<string, React.ReactNode> = {
  Users: <Users className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Crown: <Crown className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Megaphone: <Megaphone className="h-4 w-4" />,
  Headphones: <Headphones className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
}

interface CategoryFilterProps {
  categories: Record<PersonaCategory, { label: string; icon: string; description: string }>
  selected: PersonaCategory | "all"
  onSelect: (category: PersonaCategory | "all") => void
  counts: Record<string, number>
}

export function CategoryFilter({ categories, selected, onSelect, counts }: CategoryFilterProps) {
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

      {(Object.entries(categories) as [PersonaCategory, { label: string; icon: string; description: string }][]).map(
        ([key, { label, icon }]) => (
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
        )
      )}
    </div>
  )
}
