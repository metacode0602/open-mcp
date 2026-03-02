"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

const modes = [
  { value: "light", icon: Sun, label: "浅色模式" },
  { value: "dark", icon: Moon, label: "深色模式" },
  { value: "system", icon: Monitor, label: "跟随系统" },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-9 w-[108px] items-center rounded-lg border border-border bg-secondary p-1">
        <div className="h-6 w-8 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div
      className="flex items-center rounded-lg border border-border bg-secondary p-1"
      role="radiogroup"
      aria-label="主题模式"
    >
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-7 w-8 items-center justify-center rounded-md transition-all",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}
