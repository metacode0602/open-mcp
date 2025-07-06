// ===== 支付相关 =====
import { z } from "zod";
import { zSearchSchema } from "./common";

// 支付创建
export const zCreatePaymentSchema = z.object({
  userId: z.string(),
  type: z.enum(["ad", "subscription", "service", "other"]),
  relatedId: z.string().optional(),
  transactionId: z.string().optional(),
  amount: z.number().positive("金额必须为正数"),
  currency: z.string().default("CNY"),
  method: z.enum(["wechat", "alipay", "bank_transfer"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  metadata: z.record(z.any()).optional(),
});

// 支付更新
export const zUpdatePaymentSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  type: z.enum(["ad", "subscription", "service", "other"]).optional(),
  relatedId: z.string().optional(),
  amount: z.number().positive("金额必须为正数").optional(),
  currency: z.string().optional(),
  method: z.enum(["wechat", "alipay", "bank_transfer"]).optional(),
  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  transactionId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  completedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  refundReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// 支付查询
export const getPaymentSchema = z.object({
  id: z.string(),
});

// 支付搜索
export const zSearchPaymentsSchema = zSearchSchema.extend({
  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  userId: z.string().optional(),
  type: z.enum(["ad", "subscription", "service", "other"]).optional(),
  method: z.enum(["wechat", "alipay", "bank_transfer"]).optional(),
});

export const zPaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["ad", "subscription", "service", "other"]),
  relatedId: z.string().optional(),
  amount: z.number().positive("金额必须为正数"),
  currency: z.string().default("CNY"),
  method: z.enum(["wechat", "alipay", "bank_transfer"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  transactionId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  completedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  refundReason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 支付相关类型
export type Payment = z.infer<typeof zPaymentSchema>;
export type PaymentCreate = z.infer<typeof zCreatePaymentSchema>;
export type PaymentUpdate = z.infer<typeof zUpdatePaymentSchema>;
export type PaymentSearch = z.infer<typeof zSearchPaymentsSchema> & {
  field?: "id" | "amount" | "status" | "createdAt" | "updatedAt";
};
