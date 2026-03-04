"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { SkillCategoryFilter } from "./skill-category-filter"
import { SkillCard } from "./skill-card"
import { trpc } from "@/lib/trpc/client"
import { useSkillCategories } from "@/lib/use-marketplace-categories"
import { mapSkillListRowToSkill } from "../../lib/map-marketplace"
import { Skeleton } from "@repo/ui/components/ui/skeleton"

export function SkillGrid() {
  const [selected, setSelected] = useState<string | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { categories: skillCategories, categoriesList } = useSkillCategories()
  const defaultCat =
    categoriesList[0]
      ? { label: categoriesList[0].name, icon: categoriesList[0].icon ?? "Wrench" }
      : { label: "其他", icon: "Wrench" }

  const { data, isLoading } = trpc.marketplaceSkills.list.useQuery(
    { limit: 500 },
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 }
  )

  const skills = useMemo(
    () => (data?.items ?? []).map(mapSkillListRowToSkill),
    [data?.items]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: skills.length }
    for (const s of skills) {
      c[s.category] = (c[s.category] || 0) + 1
    }
    return c
  }, [skills])

  const filtered = useMemo(() => {
    let result = skills
    if (selected !== "all") {
      result = result.filter((s) => s.category === selected)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [skills, selected, searchQuery])

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-6">
          <div className="h-10 w-64 rounded-lg bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[300px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Skills 仓库</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              浏览可复用的自动化技能组件，快速搭建工作流
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索 Skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <SkillCategoryFilter
          categories={skillCategories}
          selected={selected}
          onSelect={setSelected}
          counts={counts}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SkillCard key={s.id} skill={s} categories={skillCategories} defaultCat={defaultCat} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <p className="text-lg font-medium text-foreground">未找到匹配的 Skill</p>
          <p className="mt-1 text-sm text-muted-foreground">试试调整筛选条件或搜索关键词</p>
        </div>
      )}
    </section>
  )
}
