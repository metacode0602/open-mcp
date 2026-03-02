"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { CategoryFilter } from "../../components/category-filter"
import { UsecaseCard } from "./usecase-card"
import { usecases, categories, type Category } from "@/lib/types"

export function UsecaseGrid() {
  const [selected, setSelected] = useState<Category | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: usecases.length }
    for (const uc of usecases) {
      c[uc.category] = (c[uc.category] || 0) + 1
    }
    return c
  }, [])

  const filtered = useMemo(() => {
    let result = usecases
    if (selected !== "all") {
      result = result.filter((uc) => uc.category === selected)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (uc) =>
          uc.title.toLowerCase().includes(q) ||
          uc.description.toLowerCase().includes(q) ||
          uc.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [selected, searchQuery])

  return (
    <section id="usecases" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">案例库</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              浏览经过验证的 AI 自动化工作流方案
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索案例..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <CategoryFilter
          categories={categories}
          selected={selected}
          onSelect={setSelected}
          counts={counts}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((uc) => (
            <UsecaseCard key={uc.id} usecase={uc} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <p className="text-lg font-medium text-foreground">未找到匹配的案例</p>
          <p className="mt-1 text-sm text-muted-foreground">试试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </section>
  )
}
