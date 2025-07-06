"use client"

import { CategoryShowcase } from "@/components/category-showcase"
import { SearchBar } from "@/components/search-bar"
import { Container } from "@/components/web/container"
import { PageHeader } from "@/components/web/page-header"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function CategoryPage() {
  const validTypes = ["client", "server", "application"]
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagParam = searchParams.get("tag")
  const scenarioParam = searchParams.get("scenario")

  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam)
  const [selectedScenario, setSelectedScenario] = useState<string | null>(scenarioParam)

  const categoryTitles = {
    client: "MCP 客户端",
    server: "MCP 服务器",
    application: "MCP 应用",
  }

  const categoryDescriptions = {
    client: "浏览所有支持 MCP 协议的客户端应用",
    server: "探索提供 MCP 服务的服务器应用",
    application: "发现 AI 开源应用",
  }

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag)

    // 更新URL参数
    const url = new URL(window.location.href)
    if (tag) {
      url.searchParams.set("tag", tag)
    } else {
      url.searchParams.delete("tag")
    }

    // 保留场景参数
    if (selectedScenario) {
      url.searchParams.set("scenario", selectedScenario)
    }

    router.replace(url.pathname + url.search)
  }

  const handleScenarioSelect = (scenario: string | null) => {
    setSelectedScenario(scenario)

    // 更新URL参数
    const url = new URL(window.location.href)
    if (scenario) {
      url.searchParams.set("scenario", scenario)
    } else {
      url.searchParams.delete("scenario")
    }

    // 保留标签参数
    if (selectedTag) {
      url.searchParams.set("tag", selectedTag)
    }

    router.replace(url.pathname + url.search)
  }

  return (
    <Container className="py-10">
      <PageHeader
        title="MCP 应用"
        backLink={{ href: "/", label: "返回首页" }}
        description="浏览所有支持 MCP 协议的应用"
      />

      <div className="mb-8">
        <SearchBar />
      </div>


      <CategoryShowcase category={"client"} selectedTag={selectedTag} />
    </Container>
  )
}

