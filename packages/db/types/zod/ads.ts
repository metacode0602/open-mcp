import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";

// 枚举类型定义
export const zAdsTypeEnum = z.enum(["listing", "banner"]);
export const zAdsStatusEnum = z.enum(["pending", "active", "completed", "rejected", "paused"]);
export type AdsStatus = z.infer<typeof zAdsStatusEnum>;

// 广告创建
export const zCreateAdsSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: zAdsTypeEnum,
  startDate: z.date(),
  endDate: z.date(),
  url: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().positive(),
  budget: z.coerce.number().positive(),
  userId: z.string().optional(),
  appId: z.string().optional(),
  placement: z.enum(["top", "bottom", "middle"]).optional(),
});

// 广告更新
export const zUpdateAdsSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  type: zAdsTypeEnum.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().positive().optional(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  placement: z.enum(["top", "bottom", "middle"]).optional(),
  appId: z.string().optional(),
});

// 广告搜索
export const zSearchAdsSchema = zSearchSchema.extend({
  type: zAdsTypeEnum.optional(),
  status: zAdsStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
});

// 广告
export const zAdsSchema = zBaseEntitySchema.extend({
  title: z.string(),
  description: z.string(),
  type: zAdsTypeEnum,
  status: zAdsStatusEnum,
  price: z.number().default(0),
  budget: z.number().default(0),
  startDate: z.date(),
  endDate: z.date(),
  impressions: z.number(),
  ctr: z.number(),
  clicks: z.number(),
  userId: z.string(),
  appId: z.string(),
  app: z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    website: z.string(),
    type: z.enum(["client", "server", "application"]),
    version: z.string().optional(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }).optional(),
  placement: z.enum(["top", "bottom", "middle"]),
});

export type Ads = z.infer<typeof zAdsSchema>;

export type CreateAds = z.infer<typeof zCreateAdsSchema>;
export type UpdateAds = z.infer<typeof zUpdateAdsSchema>;
export type AdsType = z.infer<typeof zAdsTypeEnum>;
