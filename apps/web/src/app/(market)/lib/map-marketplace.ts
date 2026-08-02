import type { Persona } from "@/lib/types/personas"
import type { Skill } from "@/lib/types/skills"

type PersonaListRow = {
  id: string
  slug: string
  name: string
  description: string
  descriptionZh: string | null
  features: string[] | null
  verified: boolean | null
  ownerName: string | null
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string }[]
}

type SkillListRow = {
  id: string
  slug: string
  name: string
  description: string
  version: string | null
  verified: boolean | null
  ownerName: string | null
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string }[]
}

const PERSONA_CATEGORY_FALLBACK = "operations" as const
const SKILL_CATEGORY_FALLBACK = "general-tools" as const

export function mapPersonaListRowToPersona(row: PersonaListRow): Persona {
  const desc = row.descriptionZh || row.description
  return {
    id: row.id,
    name: row.name,
    subtitle: desc.slice(0, 60) + (desc.length > 60 ? "…" : ""),
    description: desc,
    category: (row.category?.slug as Persona["category"]) ?? PERSONA_CATEGORY_FALLBACK,
    tags: row.tags.map((t) => t.name),
    author: row.ownerName ?? "",
    authorInfo: { name: row.ownerName ?? "" },
    features: row.features ?? [],
    verified: row.verified ?? false,
    price: 0,
  }
}

export function mapSkillListRowToSkill(row: SkillListRow): Skill {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.description,
    category: (row.category?.slug as Skill["category"]) ?? SKILL_CATEGORY_FALLBACK,
    version: row.version ?? "1.0.0",
    tags: row.tags.map((t) => t.name),
    author: row.ownerName ?? "",
    authorInfo: { name: row.ownerName ?? "" },
    verified: row.verified ?? false,
    price: 0,
  }
}
