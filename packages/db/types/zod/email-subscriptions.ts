import { z } from "zod";
import { zSearchSchema } from "./common";

// 用户邮件订阅创建
export const zCreateEmailSubscriptionSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  isVerified: z.boolean().optional(),
  verificationToken: z.string().optional(),
  verificationExpires: z.date().optional(),
  lastEmailSent: z.date().optional(),
  referringSite: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional().default("subscribe_form"),
  utmCampaign: z.string().optional().default("organic"),
});

// 用户邮件订阅更新
export const zUpdateEmailSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  isVerified: z.boolean().optional(),
  verificationToken: z.string().optional(),
  verificationExpires: z.date().optional(),
  lastEmailSent: z.date().optional(),
});

// 用户邮件订阅搜索
export const zSearchEmailSubscriptionsSchema = zSearchSchema.extend({
  userId: z.string().optional(),
  email: z.string().optional(),
  isVerified: z.boolean().optional(),
});