import { z } from "zod";
import { searchSchema } from "./common";

// 推荐类型枚举
export const recommendationTypeEnum = z.enum(["similar", "popular", "new", "related"]);

// 推荐应用创建
export const createRecommendationSchema = z.object({
  appId: z.string(),
  type: recommendationTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
});

// 推荐应用更新
export const updateRecommendationSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  type: recommendationTypeEnum.optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
});

// 推荐应用查询
export const getRecommendationSchema = z.object({
  id: z.string(),
});

// 推荐应用搜索
export const searchRecommendationsSchema = searchSchema.extend({
  type: recommendationTypeEnum.optional(),
  appId: z.string().optional(),
});

// 推荐应用删除
export const deleteRecommendationSchema = z.object({
  id: z.string(),
}); 