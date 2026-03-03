import { notFound } from "next/navigation"
import { PersonaDetail } from "../components/personas-detail"
import { personas, getPersonaById } from "@/lib/types/personas"
import { SiteHeader } from "../../components/site-header"
import { SiteFooter } from "../../components/site-footer"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return personas.map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const persona = getPersonaById(id)
  if (!persona) return { title: "配置包未找到" }
  return {
    title: `${persona.name} - AI 员工配置包`,
    description: persona.description,
  }
}

export default async function PersonaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const persona = getPersonaById(id)
  if (!persona) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <PersonaDetail persona={persona} />
      </main>
      <SiteFooter />
    </div>
  )
}
