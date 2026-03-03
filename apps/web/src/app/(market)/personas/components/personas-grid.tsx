"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { CategoryFilter } from "../../components/category-filter"
import { PersonaCard } from "./personas-card"
import {
  personas,
  personaCategories,
  type PersonaCategory,
} from "@/lib/types/personas"

export function PersonasGrid() {
  const [selected, setSelected] = useState<PersonaCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: personas.length }
    for (const p of personas) {
      c[p.category] = (c[p.category] || 0) + 1
    }
    return c
  }, [])

  const filtered = useMemo(() => {
    let result = personas
    if (selected !== "all") {
      result = result.filter((p) => p.category === selected)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [selected, searchQuery])

  return (
    <section id="personas" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI 员工</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              浏览经过验证的 AI 员工配置包
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索 AI 员工..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <CategoryFilter
          categories={personaCategories}
          selected={selected}
          onSelect={setSelected}
          counts={counts}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PersonaCard key={p.id} persona={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <p className="text-lg font-medium text-foreground">未找到匹配的配置包</p>
          <p className="mt-1 text-sm text-muted-foreground">
            试试调整筛选条件或搜索关键词
          </p>
        </div>
      )}
    </section>
  )
}
