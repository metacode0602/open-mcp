import { z } from "zod";
import { zSearchSchema } from "./common";

// 推荐类型枚举
export const zRecommendationTypeEnum = z.enum(["rank", "popular", "new", "related", "category"]);

// 推荐应用创建
export const zCreateRecommendationSchema = z.object({
  appId: z.string().optional(),
  category: z.string().optional(),
  type: zRecommendationTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
});

export const zRecommendationSchema = zCreateRecommendationSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 推荐应用更新
export const zUpdateRecommendationSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  type: zRecommendationTypeEnum.optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
});

// 推荐应用搜索
export const zSearchRecommendationsSchema = zSearchSchema.extend({
  type: zRecommendationTypeEnum.optional(),
  appId: z.string().optional(),
});

export type Recommendation = z.infer<typeof zRecommendationSchema>;
export type CreateRecommendation = z.infer<typeof zCreateRecommendationSchema>;
export type UpdateRecommendation = z.infer<typeof zUpdateRecommendationSchema>;
export type SearchRecommendations = z.infer<typeof zSearchRecommendationsSchema>;
