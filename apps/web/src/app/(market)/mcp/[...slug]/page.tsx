"use client"

import { use } from "react"
import { McpDetail } from "../components/mcp-detail"

export default function McpSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = use(params)
  const slugStr = Array.isArray(slug) ? slug.join("/") : slug

  return <McpDetail slug={slugStr} />
}
