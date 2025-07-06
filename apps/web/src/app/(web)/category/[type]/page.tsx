"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";

import { CategoryList } from "@/components/category-list";
import { CategoryShowcase } from "@/components/category-showcase";
import { TagFilter } from "@/components/tag-filter";
import { Container } from "@/components/web/container";
import { PageHeader } from "@/components/web/page-header";

export default function CategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const validTypes = ["client", "server", "application"];
  const { type } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");
  const subcategoryParam = searchParams.get("subcategory");

  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam);

  if (!validTypes.includes(type)) {
    notFound();
  }

  const categoryTitles = {
    client: "MCP 客户端",
    server: "MCP 服务器",
    application: "AI 应用",
  };

  const categoryDescriptions = {
    client: "浏览所有支持 MCP 协议的客户端应用",
    server: "探索提供 MCP 服务的服务器应用",
    application: "发现开源 AI 应用",
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);

    // 更新URL参数
    const url = new URL(window.location.href);
    if (tag) {
      url.searchParams.set("tag", tag);
    } else {
      url.searchParams.delete("tag");
    }

    if (selectedSubcategory) {
      url.searchParams.set("subcategory", selectedSubcategory);
    }

    router.replace(url.pathname + url.search);
  };

  const handleSubcategorySelect = (category: string | null, subcategory?: string) => {
    const newSubcategory = subcategory || category;

    // 如果点击的是"全部"，则清除子分类筛选
    if (category === "all") {
      setSelectedSubcategory(null);

      // 更新URL参数
      const url = new URL(window.location.href);
      url.searchParams.delete("subcategory");

      // 保留其他参数
      if (selectedTag) {
        url.searchParams.set("tag", selectedTag);
      }

      router.replace(url.pathname + url.search);
      return;
    }

    setSelectedSubcategory(newSubcategory);

    // 更新URL参数
    const url = new URL(window.location.href);
    if (newSubcategory) {
      url.searchParams.set("subcategory", newSubcategory);
    }

    // 保留其他参数
    if (selectedTag) {
      url.searchParams.set("tag", selectedTag);
    }
    router.replace(url.pathname + url.search);
  };

  return (
    <Container>
      <PageHeader title={categoryTitles[type as keyof typeof categoryTitles]} description={categoryDescriptions[type as keyof typeof categoryDescriptions]} />

      {/* <div className="mb-8">
				<SearchBar defaultCategory={type} />
			</div> */}

      <div className={`grid grid-cols-1 gap-6 ${type === "client" ? "md:grid-cols-1" : "md:grid-cols-4"}`}>
        {type !== "client" && (
          <div className="md:col-span-1">
            <CategoryList categoryType={type} selectedCategory={selectedSubcategory || undefined} onSelectCategory={handleSubcategorySelect} />
          </div>
        )}

        <div className={`${type === "client" ? "md:col-span-1" : "md:col-span-3"}`}>

          <TagFilter category={type} selectedTag={selectedTag} onSelectTag={handleTagSelect} />

          <CategoryShowcase category={type as "client" | "server" | "application"} selectedTag={selectedTag} selectedCategory={selectedSubcategory} />
        </div>
      </div>
    </Container>
  );
}
