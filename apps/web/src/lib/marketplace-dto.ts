import type { Persona } from "@/lib/types/personas"
import type { Skill } from "@/lib/types/skills"

/** DB/category slug 到前端 Persona 分类的映射 */
const PERSONA_CATEGORY_SLUG_MAP: Record<string, Persona["category"]> = {
  leadership: "leadership",
  engineering: "engineering",
  marketing: "marketing",
  support: "support",
  operations: "operations",
}
const DEFAULT_PERSONA_CATEGORY: Persona["category"] = "operations"

/** DB/category slug 到前端 Skill 分类的映射 */
const SKILL_CATEGORY_SLUG_MAP: Record<string, Skill["category"]> = {
  "data-collection": "data-collection",
  "ai-processing": "ai-processing",
  "platform-integration": "platform-integration",
  "content-output": "content-output",
  "general-tools": "general-tools",
}
const DEFAULT_SKILL_CATEGORY: Skill["category"] = "general-tools"

export type PersonaDetailApi = {
  id: string
  slug: string
  name: string
  description: string
  descriptionZh: string | null
  features: string[] | null
  tools: unknown
  verified: boolean | null
  ownerName: string | null
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string }[]
  skillIds: string[]
  mcpAppIds: string[]
  skills: { id: string; name: string; slug: string }[]
  mcpApps: { id: string; name: string; slug: string }[]
}

export type SkillDetailApi = {
  id: string
  slug: string
  name: string
  description: string
  descriptionZh: string | null
  longDescription: string | null
  readme: string | null
  readmeZh: string | null
  features: string[] | null
  scenario: string | null
  version: string | null
  tools: unknown
  verified: boolean | null
  ownerName: string | null
  category: { id: string; name: string; slug: string } | null
  tags: { id: string; name: string }[]
  mcpAppIds: string[]
  personaIds: string[]
  personas: { id: string; name: string; slug: string }[]
  mcpApps: { id: string; name: string; slug: string }[]
}

export function mapPersonaApiToPersona(api: PersonaDetailApi): Persona {
  const categorySlug = api.category?.slug
  const category =
    (categorySlug ? PERSONA_CATEGORY_SLUG_MAP[categorySlug] : undefined) ??
    DEFAULT_PERSONA_CATEGORY
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    subtitle: api.descriptionZh ?? api.description,
    description: api.description,
    category,
    tags: api.tags.map((t) => t.name),
    author: api.ownerName ?? "",
    authorInfo: { name: api.ownerName ?? "" },
    features: api.features ?? [],
    verified: api.verified ?? false,
    price: 0,
    skillIds: api.skillIds,
    relatedSkills: api.skills?.length ? api.skills : undefined,
  }
}

export function mapSkillApiToSkill(api: SkillDetailApi): Skill {
  const categorySlug = api.category?.slug
  const category =
    (categorySlug ? SKILL_CATEGORY_SLUG_MAP[categorySlug] : undefined) ??
    DEFAULT_SKILL_CATEGORY
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description,
    longDescription: api.longDescription ?? api.description,
    descriptionZh: api.descriptionZh ?? "",
    version: api.version ?? "0.0.0",
    tags: api.tags.map((t) => t.name),
    author: api.ownerName ?? "",
    authorInfo: { name: api.ownerName ?? "" },
    verified: api.verified ?? false,
    price: 0,
    personaIds: api.personaIds,
    relatedPersonas: api.personas?.length ? api.personas : undefined,
    readme: api.readme ?? undefined,
    readmeZh: api.readmeZh ?? undefined,
    features: api.features ?? undefined,
    scenario: api.scenario ?? undefined,
    categoryInfo: api.category ?? undefined,
    category,
  }
}
