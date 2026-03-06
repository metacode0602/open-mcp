import { useMemo } from "react"
import { trpc } from "@/lib/trpc/client"

export type CategoryDisplay = { label: string; icon: string; description?: string }

/** 将 API 返回的分类列表转为 slug -> 展示信息的 Record，便于组件按 slug 查找 */
function toCategoriesRecord(
  items: { id: string; name: string; slug: string; icon: string | null; description: string | null }[] | undefined,
  defaultIcon: string
): Record<string, CategoryDisplay> {
  if (!items?.length) return {}
  const record: Record<string, CategoryDisplay> = {}
  for (const c of items) {
    record[c.slug] = {
      label: c.name,
      icon: c.icon ?? defaultIcon,
      ...(c.description ? { description: c.description } : {}),
    }
  }
  return record
}

/** 市场页 Skill 分类：统一分类树根级分类（与 Persona 共用） */
export function useSkillCategories() {
  const { data: items, isLoading } = trpc.marketplaceCategories.listUnifiedCategories.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  })
  const categories = useMemo(() => toCategoriesRecord(items, "Wrench"), [items])
  return { categories, categoriesList: items ?? [], isLoading }
}

/** 市场页 Persona 分类：统一分类树根级分类（与 Skill 共用） */
export function usePersonaCategories() {
  const { data: items, isLoading } = trpc.marketplaceCategories.listUnifiedCategories.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  })
  const categories = useMemo(() => toCategoriesRecord(items, "Settings"), [items])
  return { categories, categoriesList: items ?? [], isLoading }
}
