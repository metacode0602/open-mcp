"use client"

import { use } from "react"
import { SkillDetail } from "../components/skill-detail"

export default function SkillSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = use(params)
  const slugStr = Array.isArray(slug) ? slug.join("/") : slug

  return <SkillDetail slug={slugStr} />
}
