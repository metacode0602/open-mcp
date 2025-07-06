import { z } from "zod";
import { searchSchema } from "./common";

// 枚举类型定义
export const suggestionTypeEnum = z.enum(["feature", "bug", "improvement", "documentation", "other"]);
export const suggestionStatusEnum = z.enum(["pending", "reviewing", "accepted", "implemented", "rejected", "duplicate"]);

// 建议创建
export const createSuggestionSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: suggestionTypeEnum,
  appId: z.string().optional(),
});

export const zSuggestionSchema = createSuggestionSchema.extend({
  appId: z.string(),
  userId: z.string(),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  status: suggestionStatusEnum,
  type: suggestionTypeEnum,
  upvotes: z.number().default(0),
  priority: z.string().optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  attachmentUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  adminRemarks: z.string().optional(),
  implementedAt: z.date().optional(),
});

export type Suggestion = z.infer<typeof zSuggestionSchema>;
// 建议更新
export const updateSuggestionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  type: suggestionTypeEnum.optional(),
  status: suggestionStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
});

// 建议查询
export const getSuggestionSchema = z.object({
  id: z.string(),
});

// 建议搜索
export const searchSuggestionsSchema = searchSchema.extend({
  type: suggestionTypeEnum.optional(),
  status: suggestionStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
  submitter: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

// 建议删除
export const deleteSuggestionSchema = z.object({
  id: z.string(),
}); 