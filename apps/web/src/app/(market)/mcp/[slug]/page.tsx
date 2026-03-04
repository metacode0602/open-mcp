"use client"

import { use } from "react"
import { McpDetail } from "../components/mcp-detail"

export default function McpSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  return <McpDetail slug={slug} />
}
