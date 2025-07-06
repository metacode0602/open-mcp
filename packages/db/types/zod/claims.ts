import { z } from "zod";
import { zAppTypeEnum } from "./apps";
import { zSearchSchema } from "./common";

// 所有权申请状态
export const ClaimStatusEnum = z.enum(["pending", "approved", "rejected"]);

// 所有权申请创建
export const zCreateClaimSchema = z.object({
  appId: z.string(),
  email: z.string().email("请输入有效的邮箱地址"),
  proofUrl: z.string().url("请输入有效的URL"),
  proofType: z.enum(["github", "website", "email", "other"], {
    errorMap: () => ({ message: "请选择有效的证明类型" }),
  }),
  additionalInfo: z.string().optional(),
  status: ClaimStatusEnum.optional().default("pending"),
  userId: z.string().optional(),
  userName: z.string(),
  title: z.string(),
  userEmail: z.string().email("请输入有效的邮箱地址"),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.enum(["client", "server", "application"]),
  appIcon: z.string().optional().nullable(),
});

// Claim表单数据类型 - 更新后包含邮箱验证
export const zCreateClaimsFormSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  proofUrl: z.string().url("请输入有效的URL"),
  proofType: z.enum(["github", "website", "email", "other"], {
    errorMap: () => ({ message: "请选择有效的证明类型" }),
  }),
  appId: z.string(),
  identifier: z.string(),
  additionalInfo: z.string().optional(),
})

export const zUpdateClaimSchema = z.object({
  id: z.string(),
  appId: z.string(),
  email: z.string().email("请输入有效的邮箱地址"),
  proofUrl: z.string().url("请输入有效的URL"),
  proofType: z.enum(["github", "website", "email", "other"], {
    errorMap: () => ({ message: "请选择有效的证明类型" }),
  }),
  additionalInfo: z.string().optional(),
  status: ClaimStatusEnum.optional().default("pending"),
  userId: z.string().optional(),
  userName: z.string(),
  title: z.string(),
  userEmail: z.string().email("请输入有效的邮箱地址"),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.enum(["client", "server", "application"]),
  appIcon: z.string().optional(),
});

export const zClaimsSchema = z.object({
  id: z.string(),
  appId: z.string(),
  email: z.string().email("请输入有效的邮箱地址"),
  proofUrl: z.string().url("请输入有效的URL"),
  proofType: z.enum(["github", "website", "email", "other"], {
    errorMap: () => ({ message: "请选择有效的证明类型" }),
  }),
  additionalInfo: z.string().optional(),
  status: ClaimStatusEnum.optional().default("pending"),
  userId: z.string(),
  userName: z.string(),
  title: z.string().optional(),
  userEmail: z.string(),
  appName: z.string(),
  appSlug: z.string(),
  appType: z.enum(["client", "server", "application"]),
  appIcon: z.string().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Claims = z.infer<typeof zClaimsSchema>;

// 声明搜索
export const zSearchClaimsSchema = zSearchSchema.extend({
  status: ClaimStatusEnum.optional(),
  userId: z.string().optional(),
  appId: z.string().optional(),
  appType: zAppTypeEnum.optional(),
});


export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;

export const ClaimTypeEnum = z.enum(["app", "content", "account", "other"]);
export type ClaimType = z.infer<typeof ClaimTypeEnum>;
export type zCreateClaimSchema = z.infer<typeof zCreateClaimSchema>;
export type zUpdateClaimSchema = z.infer<typeof zUpdateClaimSchema>;
export type zClaimsSchema = z.infer<typeof zClaimsSchema>;

