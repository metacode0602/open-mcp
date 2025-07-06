import { z } from "zod";
import { invoiceStatusEnum, invoiceTypeEnum, searchSchema } from "./common";


// 发票创建
export const createInvoiceSchema = z.object({
  userId: z.string(),
  paymentId: z.string(),
  type: invoiceTypeEnum,
  title: z.string().min(1, "标题不能为空"),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("邮箱格式不正确"),
});

// 发票更新
export const updateInvoiceSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  paymentId: z.string().optional(),
  type: invoiceTypeEnum.optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  status: invoiceStatusEnum.optional(),
});

// 发票查询
export const getInvoiceSchema = z.object({
  id: z.string(),
});

// 发票搜索
export const searchInvoicesSchema = searchSchema.extend({
  status: invoiceStatusEnum.optional(),
  userId: z.string().optional(),
  paymentId: z.string().optional(),
  type: invoiceTypeEnum.optional(),
});

// 发票删除
export const deleteInvoiceSchema = z.object({
  id: z.string(),
}); 