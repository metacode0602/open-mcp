import { z } from "zod";
import { zSearchSchema } from "./common";

// 枚举类型定义
export const zSuggestionTypeEnum = z.enum(["feature", "bug", "improvement", "documentation", "other"]);
export const zSuggestionStatusEnum = z.enum(["pending", "reviewing", "accepted", "implemented", "rejected", "duplicate"]);
export const zSuggestionPriorityEnum = z.enum(["low", "medium", "high"]);

// 建议创建
export const zCreateSuggestionSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: zSuggestionTypeEnum,
  appId: z.string(),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().optional(),
  status: zSuggestionStatusEnum.optional(),
  upvotes: z.number().optional(),
  priority: z.string().optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  attachmentUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  adminRemarks: z.string().optional(),
});

export const zSuggestionSchema = zCreateSuggestionSchema.extend({
  appId: z.string(),
  userId: z.string(),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  status: zSuggestionStatusEnum,
  type: zSuggestionTypeEnum,
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

export const zUpdateSuggestionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  type: zSuggestionTypeEnum.optional(),
  status: zSuggestionStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
  attachmentUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  upvotes: z.number().optional(),
  priority: z.string().optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  adminRemarks: z.string().optional(),
});

// 建议搜索
export const zSearchSuggestionsSchema = zSearchSchema.extend({
  type: zSuggestionTypeEnum.optional(),
  status: zSuggestionStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
  submitter: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type SuggestionSearch = z.infer<typeof zSearchSuggestionsSchema>;

// Suggestion表单数据类型 - 增强版
export const zCreateSuggestionFormSchema = z.object({
  title: z.string().min(5, "标题至少需要5个字符"),
  description: z.string().min(20, "描述至少需要20个字符"),
  type: zSuggestionTypeEnum,
  priority: z.enum(["low", "medium", "high"]).optional(),
  reproducible: z.boolean().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
})
export type CreateSuggestionForm = z.infer<typeof zCreateSuggestionFormSchema>
export type UpdateSuggestionForm = z.infer<typeof zUpdateSuggestionSchema>
export type SuggestionPriority = z.infer<typeof zSuggestionPriorityEnum>
export type SuggestionStatus = z.infer<typeof zSuggestionStatusEnum>
export type SuggestionType = z.infer<typeof zSuggestionTypeEnum>;