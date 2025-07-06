import { z } from "zod";
import { zInvoiceTypeEnum, zInvoiceStatusEnum, zSearchSchema, zBaseEntitySchema } from "./common";


// 发票创建
export const zCreateInvoiceSchema = z.object({
  userId: z.string(),
  paymentId: z.string(),
  type: zInvoiceTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
});

// 发票更新
export const zUpdateInvoiceSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  paymentId: z.string().optional(),
  type: zInvoiceTypeEnum.optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  status: zInvoiceStatusEnum.optional(),
});

// 发票搜索
export const zSearchInvoicesSchema = zSearchSchema.extend({
  status: zInvoiceStatusEnum.optional(),
  userId: z.string().optional(),
  paymentId: z.string().optional(),
  type: zInvoiceTypeEnum.optional(),
});

export const zInvoiceSchema = zBaseEntitySchema.extend({
  id: z.string(),
  userId: z.string(),
  paymentId: z.string(),
  type: zInvoiceTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
});

export type zCreateInvoiceSchema = z.infer<typeof zCreateInvoiceSchema>;
export type zUpdateInvoiceSchema = z.infer<typeof zUpdateInvoiceSchema>;
export type zSearchInvoicesSchema = z.infer<typeof zSearchInvoicesSchema>;

