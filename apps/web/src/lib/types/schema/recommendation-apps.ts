import { z } from "zod";

import { searchSchema } from "./common";

// 推荐应用关联创建
export const createRecommendationAppSchema = z.object({
  recommendationId: z.string(),
  appId: z.string(),
  order: z.number().int().optional(),
});

// 推荐应用关联更新
export const updateRecommendationAppSchema = z.object({
  id: z.string(),
  recommendationId: z.string().optional(),
  appId: z.string().optional(),
  order: z.number().int().optional(),
});

// 推荐应用关联查询
export const getRecommendationAppSchema = z.object({
  id: z.string(),
});

// 推荐应用关联搜索
export const searchRecommendationAppsSchema = searchSchema.extend({
  recommendationId: z.string().optional(),
  appId: z.string().optional(),
});

// 推荐应用关联删除
export const deleteRecommendationAppSchema = z.object({
  id: z.string(),
}); 