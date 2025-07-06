import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";
import { zAppTypeEnum } from "./apps";

// 推荐应用关联创建
export const zCreateRecommendationAppSchema = z.object({
  recommendationId: z.string(),
  appId: z.string(),
  order: z.number().int().optional()
});

// 推荐应用关联更新
export const zUpdateRecommendationAppSchema = z.object({
  id: z.string(),
  recommendationId: z.string().optional(),
  appId: z.string().optional(),
  order: z.number().int().optional(),
});

// 推荐应用关联查询
export const zRecommendationAppSchema = zBaseEntitySchema.extend({
  id: z.string(),
  appId: z.string(),
  order: z.number().int().optional(),
  recommendationId: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const zRecommendationAppWithAppSchema = z.object({
  id: z.string(),
  appId: z.string(),
  order: z.number().int().default(1),
  recommendationId: z.string().optional(),
  status: z.enum(["active", "pending"]).optional(),
  app: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    type: zAppTypeEnum,
    icon: z.string().optional().nullable(),
    stars: z.number().int().optional().nullable(),
    website: z.string().optional().nullable().or(z.literal("")),
    github: z.string().optional().nullable().or(z.literal("")),
    docs: z.string().optional().nullable().or(z.literal("")),
    version: z.string().optional().nullable(),
    license: z.string().optional().nullable(),
  }).optional(),
})
// 推荐应用关联搜索
export const zSearchRecommendationAppsSchema = zSearchSchema.extend({
  recommendationId: z.string().optional(),
  appId: z.string().optional(),
});

export type RecommendationApp = z.infer<typeof zRecommendationAppSchema>;
export type RecommendationAppWithApp = z.infer<typeof zRecommendationAppWithAppSchema>
export type CreateRecommendationApp = z.infer<typeof zCreateRecommendationAppSchema>;
export type UpdateRecommendationApp = z.infer<typeof zUpdateRecommendationAppSchema>;
export type SearchRecommendationApps = z.infer<typeof zSearchRecommendationAppsSchema>;
