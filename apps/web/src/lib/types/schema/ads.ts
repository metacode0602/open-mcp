import { z } from "zod";

import { searchSchema } from "./common";

// 枚举类型定义
export const adTypeEnum = z.enum(["listing", "banner"]);
export const adStatusEnum = z.enum(["pending", "active", "completed", "rejected", "paused"]);
export type AdStatus = z.infer<typeof adStatusEnum>;

// 广告创建
export const createAdSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: adTypeEnum,
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
export const updateAdSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  type: adTypeEnum.optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().positive().optional(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  placement: z.enum(["top", "bottom", "middle"]).optional(),
  appId: z.string().optional(),
});

// 定义广告类型
export const zAdSchema = z.object({
  id: z.string(),
  type: z.enum(["listing", "banner"]),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  imageUrl: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["active", "pending", "completed"]),
  price: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  ctr: z.number(),
  createdAt: z.string(),
});

export type Ad = z.infer<typeof zAdSchema>;

// 广告查询
export const getAdSchema = z.object({
  id: z.string(),
});

// 广告搜索
export const searchAdsSchema = searchSchema.extend({
  type: adTypeEnum.optional(),
  status: adStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
});

// 广告删除
export const deleteAdSchema = z.object({
  id: z.string(),
});


export const zAdsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: adTypeEnum,
  status: adStatusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  startDate: z.date(),
  endDate: z.date(),
  impressions: z.number(),
  clicks: z.number(),
  userId: z.string(),
  appId: z.string(),
  app: z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string(),
    url: z.string(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  payments: z.array(z.object({
    id: z.string(),
    amount: z.number(),
    status: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })),
});

export type Ads = z.infer<typeof zAdsSchema>;