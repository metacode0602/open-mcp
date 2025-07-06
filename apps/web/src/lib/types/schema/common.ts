import { z } from "zod";

// 通用分页查询参数
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// 通用排序参数
export const sortSchema = z.object({
  field: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// 通用搜索参数
export const searchSchema = z.object({
  query: z.string().optional(),
  ...paginationSchema.shape,
  ...sortSchema.shape,
}); 

// 枚举类型定义
export const invoiceTypeEnum = z.enum(["personal", "company"]);
export const invoiceStatusEnum = z.enum(["pending", "issued", "sent"]);


// 支付状态枚举
export const PaymentStatusEnum = z.enum(["pending", "completed", "failed", "refunded"])
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>

// 支付类型枚举
export const PaymentTypeEnum = z.enum(["ad", "subscription", "service", "other"])
export type PaymentType = z.infer<typeof PaymentTypeEnum>

// 支付方法枚举
export const PaymentMethodEnum = z.enum(["wechat", "alipay", "bank_transfer"])
export type PaymentMethod = z.infer<typeof PaymentMethodEnum>


// 资产类型枚举
export const AssetTypes = {
  UNKNOWN: "unknown",
  AVATAR: "avatar",
  BANNER: "banner",
  ICON: "icon",
  LOGO: "logo",
  IMAGE: "image",
  DOCUMENT: "document",
} as const;