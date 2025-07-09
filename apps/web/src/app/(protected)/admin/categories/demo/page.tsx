"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { CategorySelect } from "@/components/admin/category-select";
import { useCategoryState } from "@/hooks/use-category-state";
import { trpc } from "@/lib/trpc/client";

export default function CategoryDemoPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // 获取分类数据
  const { data: categoriesData } = trpc.categories.search.useQuery({
    limit: 100,
    page: 1,
  });

  const categories = categoriesData?.data || [];

  // 使用状态管理hook
  const singleSelectState = useCategoryState({
    categories,
    initialSelectedIds: selectedCategoryId ? [selectedCategoryId] : [],
    multiple: false,
  });

  const multiSelectState = useCategoryState({
    categories,
    initialSelectedIds: selectedCategoryIds,
    multiple: true,
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">分类级联选择演示</h1>
        <p className="text-muted-foreground mt-2">
          展示分类级联选择组件的各种功能和使用方式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 单选模式 */}
        <Card>
          <CardHeader>
            <CardTitle>单选模式</CardTitle>
            <CardDescription>
              只能选择一个分类，适用于主分类选择
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategorySelect
              categories={categories}
              name="singleCategory"
              label="选择主分类"
              description="选择一个主要分类"
              placeholder="选择分类..."
              multiple={false}
            />

            <Separator />

            <div>
              <h4 className="font-medium mb-2">当前状态：</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">选中的ID：</span>
                  <Badge variant="outline" className="ml-2">
                    {singleSelectState.selectedIds[0] || "无"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">选中的分类：</span>
                  {singleSelectState.selectedCategories.length > 0 ? (
                    <Badge className="ml-2">
                      {singleSelectState.selectedCategories[0].name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground ml-2">无</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => singleSelectState.clearSelection()}
              >
                清空选择
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstCategory = categories[0];
                  if (firstCategory) {
                    singleSelectState.setSelection([firstCategory.id]);
                  }
                }}
              >
                选择第一个
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 多选模式 */}
        <Card>
          <CardHeader>
            <CardTitle>多选模式</CardTitle>
            <CardDescription>
              可以选择多个分类，适用于标签选择
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategorySelect
              categories={categories}
              name="multipleCategories"
              label="选择分类"
              description="可以选择多个分类"
              placeholder="选择分类..."
              multiple={true}
            />

            <Separator />

            <div>
              <h4 className="font-medium mb-2">当前状态：</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">选中的ID：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {multiSelectState.selectedIds.length > 0 ? (
                      multiSelectState.selectedIds.map(id => (
                        <Badge key={id} variant="outline" className="text-xs">
                          {id}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">无</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">选中的分类：</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {multiSelectState.selectedCategories.length > 0 ? (
                      multiSelectState.selectedCategories.map(category => (
                        <Badge key={category.id} className="text-xs">
                          {category.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">无</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => multiSelectState.clearSelection()}
              >
                清空选择
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstTwoCategories = categories.slice(0, 2);
                  if (firstTwoCategories.length > 0) {
                    multiSelectState.setSelection(firstTwoCategories.map(cat => cat.id));
                  }
                }}
              >
                选择前两个
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 分类数据结构展示 */}
      <Card>
        <CardHeader>
          <CardTitle>分类数据结构</CardTitle>
          <CardDescription>
            展示分类的级联结构数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">原始分类数据：</h4>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(categories, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">级联结构数据：</h4>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(singleSelectState.cascadeOptions, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 