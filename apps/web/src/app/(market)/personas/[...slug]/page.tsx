"use client"

import { use } from "react"
import { PersonaDetail } from "../components/personas-detail"
import { SiteHeader } from "../../components/site-header"
import { SiteFooter } from "../../components/site-footer"

export default function PersonaSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = use(params)
  const slugStr = Array.isArray(slug) ? slug.join("/") : slug

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <PersonaDetail slug={slugStr} />
      </main>
      <SiteFooter />
    </div>
  )
}
