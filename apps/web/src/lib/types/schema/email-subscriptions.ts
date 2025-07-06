import { z } from "zod";

import { searchSchema } from "./common";

// 用户邮件订阅创建
export const createEmailSubscriptionSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  isVerified: z.boolean().optional(),
  verificationToken: z.string().optional(),
  verificationExpires: z.date().optional(),
  lastEmailSent: z.date().optional(),
});

// 用户邮件订阅更新
export const updateEmailSubscriptionSchema = z.object({
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

// 用户邮件订阅查询
export const getEmailSubscriptionSchema = z.object({
  id: z.string(),
});

// 用户邮件订阅搜索
export const searchEmailSubscriptionsSchema = searchSchema.extend({
  userId: z.string().optional(),
  email: z.string().optional(),
  isVerified: z.boolean().optional(),
});

// 用户邮件订阅删除
export const deleteEmailSubscriptionSchema = z.object({
  id: z.string(),
}); 