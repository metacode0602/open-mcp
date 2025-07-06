"use client";

import { Category } from "@repo/db/types";
import { cn } from "@repo/ui/lib/utils";
import { usePathname, useRouter } from "next/navigation";

import { trpc } from "@/lib/trpc/client";

interface CategoryListProps {
  categoryType: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string | null) => void;
}

export function CategoryList({ categoryType, selectedCategory, onSelectCategory }: CategoryListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = trpc.mcpCategories.getCategories.useQuery(
    {
      type: categoryType as "client" | "server" | "application",
    },
    {
      enabled: true,
    }
  );
  const handleCategoryClick = (category: string | null) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 sticky top-4">
      <h3 className="text-lg font-medium mb-3 text-foreground">分类浏览</h3>
      <div className="space-y-1">
        <div
          className={cn("flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition-colors", !selectedCategory && "bg-primary/10 text-primary font-medium")}
          onClick={() => handleCategoryClick(null)}
        >
          <span>全部{categoryType === "client" ? "客户端" : categoryType === "server" ? "服务器" : "AI 应用"}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{categories?.reduce((total, cat) => total + (cat.appsCount || 0), 0)}</span>
        </div>

        {categories &&
          categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition-colors",
                selectedCategory === category.slug && "bg-primary/10 text-primary font-medium"
              )}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <span>{category.name}</span>
              {category.appsCount !== undefined && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{category.appsCount}</span>}
            </div>
          ))}
      </div>
    </div>
  );
}
