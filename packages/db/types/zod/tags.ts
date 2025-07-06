import { z } from "zod";
import { zSearchSchema } from "./common";

// 枚举类型定义
export const zTagSourceEnum = z.enum(["ai", "user", "admin"]);

// 标签创建
export const zCreateTagSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  source: zTagSourceEnum.optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空"),
  createdBy: z.string().optional(),
});

export const zTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  source: zTagSourceEnum.optional(),
});
// 标签更新
export const zUpdateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  source: zTagSourceEnum.optional(),
});

// 标签搜索
export const zSearchTagsSchema = zSearchSchema.extend({
  source: zTagSourceEnum.optional(),
});

export type TagSource = z.infer<typeof zTagSourceEnum>;
export type CreateTag = z.infer<typeof zCreateTagSchema>;
export type UpdateTag = z.infer<typeof zUpdateTagSchema>;
export type SearchTags = z.infer<typeof zSearchTagsSchema>;

export type Tag = z.infer<typeof zTagSchema>;