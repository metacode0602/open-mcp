import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";

export const zCategoryStatusEnum = z.enum(["offline", "online"]);

// 分类创建
export const zCreateCategorySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空"),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable()
});

export const zCategorySchema = zBaseEntitySchema.extend({
  name: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  icon: z.string().optional(),
  status: zCategoryStatusEnum,
  parentId: z.string().nullable(),
  appsCount: z.coerce.number().optional()
});

// 分类更新
export const zUpdateCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable()
});

// 分类搜索
export const zSearchCategoriesSchema = zSearchSchema.extend({
  parentId: z.string().optional(),
});

export type CategoryStatus = z.infer<typeof zCategoryStatusEnum>;
export type Category = z.infer<typeof zCategorySchema>;
export type CreateCategory = z.infer<typeof zCreateCategorySchema>;
export type UpdateCategory = z.infer<typeof zUpdateCategorySchema>;
export type SearchCategories = z.infer<typeof zSearchCategoriesSchema>;
