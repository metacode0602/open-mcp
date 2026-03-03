import { notFound } from "next/navigation"
import { SkillDetail } from "../components/skill-detail"
import { skills, getSkillById } from "@/lib/types"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return skills.map((s) => ({ id: s.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const skill = getSkillById(id)
  if (!skill) return { title: "Skill 未找到" }
  return {
    title: `${skill.name} - OpenClaw Skills`,
    description: skill.description,
  }
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: id } = await params
  const skill = getSkillById(id)
  if (!skill) notFound()

  return (
    <SkillDetail skill={skill} />
  )
}
