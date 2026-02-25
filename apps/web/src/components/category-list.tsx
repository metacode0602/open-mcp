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
    <div className="bg-card rounded-lg border shadow-sm p-4 sticky top-20 sm:top-24 z-10 md:z-0">
      <h3 className="text-base sm:text-lg font-medium mb-3 text-foreground">分类浏览</h3>
      <div className="space-y-1">
        <div
          className={cn("flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer hover:bg-muted transition-colors touch-manipulation", !selectedCategory && "bg-primary/10 text-primary font-medium")}
          onClick={() => handleCategoryClick(null)}
        >
          <span className="text-sm sm:text-base">全部{categoryType === "client" ? "客户端" : categoryType === "server" ? "服务器" : "AI 应用"}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">{categories?.reduce((total, cat) => total + (cat.appsCount || 0), 0)}</span>
        </div>

        {categories &&
          categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer hover:bg-muted transition-colors touch-manipulation",
                selectedCategory === category.slug && "bg-primary/10 text-primary font-medium"
              )}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <span className="text-sm sm:text-base truncate min-w-0">{category.name}</span>
              {category.appsCount !== undefined && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">{category.appsCount}</span>}
            </div>
          ))}
      </div>
    </div>
  );
}
