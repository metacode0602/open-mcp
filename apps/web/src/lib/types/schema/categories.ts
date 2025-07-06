import { z } from "zod";
import { searchSchema } from "./common";

// 分类创建
export const createCategorySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空"),
  icon: z.string().optional(),
});

// 分类更新
export const updateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  icon: z.string().optional(),
});

// 分类查询
export const getCategorySchema = z.object({
  id: z.string(),
});

// 分类搜索
export const searchCategoriesSchema = searchSchema.extend({
  parentId: z.string().optional(),
});

// 分类删除
export const deleteCategorySchema = z.object({
  id: z.string(),
}); 