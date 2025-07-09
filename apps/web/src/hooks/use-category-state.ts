import { useState, useCallback, useMemo } from "react";

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  slug: string;
  status: "online" | "offline";
}

interface UseCategoryStateProps {
  categories: Category[];
  initialSelectedIds?: string[];
  multiple?: boolean;
}

export function useCategoryState({
  categories,
  initialSelectedIds = [],
  multiple = false,
}: UseCategoryStateProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  // 构建级联结构
  const cascadeOptions = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];
    const childrenMap = new Map<string, Category[]>();

    // 首先创建映射
    categories.forEach(category => {
      categoryMap.set(category.id, category);
      if (!category.parentId) {
        rootCategories.push(category);
      } else {
        if (!childrenMap.has(category.parentId)) {
          childrenMap.set(category.parentId, []);
        }
        childrenMap.get(category.parentId)!.push(category);
      }
    });

    // 构建级联结构
    const buildCascade = (parent: Category) => {
      const children = childrenMap.get(parent.id) || [];
      return {
        id: parent.id,
        name: parent.name,
        description: parent.description,
        children: children.map(child => ({
          id: child.id,
          name: child.name,
          description: child.description,
        })),
      };
    };

    return rootCategories.map(buildCascade);
  }, [categories]);

  // 根据ID查找分类
  const findCategoryById = useCallback((id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  // 获取选中的分类对象
  const selectedCategories = useMemo(() => {
    return selectedIds.map(id => findCategoryById(id)).filter(Boolean) as Category[];
  }, [selectedIds, findCategoryById]);

  // 处理选择变化
  const handleSelect = useCallback((categoryId: string) => {
    if (multiple) {
      setSelectedIds(prev => {
        const isSelected = prev.includes(categoryId);
        if (isSelected) {
          return prev.filter(id => id !== categoryId);
        } else {
          return [...prev, categoryId];
        }
      });
    } else {
      setSelectedIds([categoryId]);
    }
  }, [multiple]);

  // 移除选中的分类
  const removeCategory = useCallback((categoryId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== categoryId));
  }, []);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // 设置选择
  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  // 检查是否选中
  const isSelected = useCallback((categoryId: string) => {
    return selectedIds.includes(categoryId);
  }, [selectedIds]);

  return {
    // 状态
    selectedIds,
    selectedCategories,
    cascadeOptions,

    // 方法
    handleSelect,
    removeCategory,
    clearSelection,
    setSelection,
    isSelected,
    findCategoryById,
  };
} 