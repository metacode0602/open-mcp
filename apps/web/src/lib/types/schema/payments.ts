// ===== 支付相关 =====

import { z } from "zod";
import { PaymentMethodEnum, PaymentStatusEnum, PaymentTypeEnum, invoiceStatusEnum, invoiceTypeEnum, searchSchema } from "./common";


// 支付创建
export const createPaymentSchema = z.object({
	userId: z.string(),
	amount: z.number().positive(),
	currency: z.string().length(3),
	description: z.string().min(1, "描述不能为空"),
	invoiceType: invoiceTypeEnum,
	invoiceData: z.record(z.any()),
});

// 支付更新
export const updatePaymentSchema = z.object({
	id: z.string(),
	userId: z.string().optional(),
	amount: z.number().positive().optional(),
	currency: z.string().length(3).optional(),
	description: z.string().min(1, "描述不能为空").optional(),
	invoiceType: invoiceTypeEnum.optional(),
	invoiceData: z.record(z.any()).optional(),
	status: invoiceStatusEnum.optional(),
});

// 支付查询
export const getPaymentSchema = z.object({
	id: z.string(),
});

// 支付搜索
export const searchPaymentsSchema = searchSchema.extend({
	status: PaymentStatusEnum.optional(),
	userId: z.string().optional(),
	invoiceType: invoiceTypeEnum.optional(),
	method: PaymentMethodEnum.optional(),
  type: PaymentTypeEnum.optional(),
});

// 支付删除
export const deletePaymentSchema = z.object({
	id: z.string(),
});

export const zPaymentSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: z.enum(["ad", "subscription", "service", "other"]),
	relatedId: z.string().optional(),
	amount: z.number().positive("金额必须为正数"),
	currency: z.string().default("CNY").nullish(),
	method: z.enum(["wechat", "alipay", "bank_transfer"]),
	transactionId: z.string().optional(),
	invoiceNumber: z.string().optional(),
	metadata: z.record(z.any()).optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	status: z.enum(["pending", "completed", "failed", "refunded"]),
	completedAt: z.date().optional(),
	refundedAt: z.date().optional(),
	refundReason: z.string().optional(),
	invoiceType: invoiceTypeEnum,
	invoiceData: z.record(z.any()),
});



// 支付相关类型
export type Payment = z.infer<typeof zPaymentSchema>;
export type PaymentCreate = z.infer<typeof createPaymentSchema>;
export type PaymentUpdate = z.infer<typeof updatePaymentSchema>;
export type PaymentSearch = z.infer<typeof searchPaymentsSchema> & {
	field?: "id" | "amount" | "status" | "createdAt" | "updatedAt";
};
