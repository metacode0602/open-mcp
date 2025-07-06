import { z } from "zod";
import { searchSchema } from "./common";

// 枚举类型定义
export const tagSourceEnum = z.enum(["ai", "user", "admin"]);

// 标签创建
export const createTagSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  source: tagSourceEnum.optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空"),
  createdBy: z.string().optional(),
});

// 标签更新
export const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  source: tagSourceEnum.optional(),
});

// 标签查询
export const getTagSchema = z.object({
  id: z.string(),
});

// 标签搜索
export const searchTagsSchema = searchSchema.extend({
  source: tagSourceEnum.optional(),
});

// 标签删除
export const deleteTagSchema = z.object({
  id: z.string(),
}); 