import { z } from "zod";
import { zSearchSchema } from "./common";

// 相关应用创建
export const zCreateRelatedAppSchema = z.object({
  appId: z.string(),
  relatedAppId: z.string(),
  similarity: z.number().optional(),
});

export const zRelatedAppSchema = zCreateRelatedAppSchema.extend({
  id: z.string(),
  icon: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  stars: z.number().optional().default(5),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 相关应用更新
export const zUpdateRelatedAppSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  relatedAppId: z.string().optional(),
  similarity: z.number().optional(),
});


// 相关应用搜索
export const zSearchRelatedAppsSchema = zSearchSchema.extend({
  appId: z.string().optional(),
  relatedAppId: z.string().optional(),
});

export type RelatedApp = z.infer<typeof zRelatedAppSchema>;
export type CreateRelatedApp = z.infer<typeof zCreateRelatedAppSchema>;
export type UpdateRelatedApp = z.infer<typeof zUpdateRelatedAppSchema>;
export type SearchRelatedApps = z.infer<typeof zSearchRelatedAppsSchema>;
