import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";
import { zAppTypeEnum } from "./apps";

// 应用提交状态枚举
export const zSubmissionStatusEnum = z.enum([
  "pending",
  "approved",
  "rejected",
  "archived"
]);

// 应用提交创建
export const zCreateAppSubmissionSchema = z.object({
  userId: z.string(),
  status: zSubmissionStatusEnum.default("pending"),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  type: zAppTypeEnum,
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  docs: z.string().url().optional().or(z.literal("")),
  favicon: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
});

// 应用提交更新
export const zUpdateAppSubmissionSchema = z.object({
  id: z.string(),
  status: zSubmissionStatusEnum.optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  type: zAppTypeEnum.optional(),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  docs: z.string().url().optional().or(z.literal("")),
  favicon: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  rejectionReason: z.string().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.string().optional(),
  approvedAppId: z.string().optional(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().optional(),
});

// 应用提交搜索
export const zSearchAppSubmissionsSchema = zSearchSchema.extend({
  appId: z.string().optional(),
  userId: z.string().optional(),
  status: zSubmissionStatusEnum.optional(),
});

export const zAppSubmissionSchema = zBaseEntitySchema.extend({
  status: zSubmissionStatusEnum,
  appId: z.string().nullable(),
  userId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional().nullable(),
  sourceCode: z.string().optional(),
  type: zAppTypeEnum,
  features: z.array(z.string()).optional().nullable(),
  tools: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional().nullish(),
  rejectionReason: z.string().optional().nullable(),
  reviewedAt: z.date().optional().nullable(),
  reviewedBy: z.string().optional().nullable(),
  approvedAppId: z.string().optional().nullable(),
  approvedAt: z.date().optional().nullable(),
  approvedBy: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional().nullable(),
});

// 应用提交审批
export const zAppSubmissionApproveSchema = z.object({
  id: z.string(),
  slug: z.string(),
  type: zAppTypeEnum,
  categoryId: z.string(),
});

export const zWebCreateAppSubmissionSchema = z.object({
  name: z.string().min(1), //姓名
  description: z.string().min(10), //应用描述
  email: z.string().email(), //邮箱
  website: z.string().url().optional().or(z.literal("")), //网站
  github: z.string().url().optional().or(z.literal("")), //github
  tags: z.array(z.string()).optional(), //标签
  logo: z.string().optional(), //logo
  favicon: z.string().optional(), //favicon
  title: z.string(), //标题
  type: zAppTypeEnum, //类型
});

export const zWebUpdateAppSubmissionSchema = z.object({
  id: z.string(),
  status: zSubmissionStatusEnum,
  type: zAppTypeEnum,
  longDescription: z.string().optional(),
  docs: z.string().optional(),       // readme文档，在抓取之后更新
  version: z.string().optional(), // 版本号 在抓取之后更新
  license: z.string().optional(), // 许可证 在抓取之后更新
  scenario: z.string().optional(), // 应用场景 在抓取之后更新
  features: z.array(z.string()).optional(), // 应用特点 在抓取之后更新
  tags: z.array(z.string()).optional(), // 应用标签 v在抓取之后更新
});


export type AppSubmissionStatus = z.infer<typeof zSubmissionStatusEnum>;
export type AppSubmission = z.infer<typeof zAppSubmissionSchema>;
export type CreateAppSubmission = z.infer<typeof zCreateAppSubmissionSchema>;
export type UpdateAppSubmission = z.infer<typeof zUpdateAppSubmissionSchema>;
export type SearchAppSubmissions = z.infer<typeof zSearchAppSubmissionsSchema>;
export type WebCreateAppSubmission = z.infer<typeof zWebCreateAppSubmissionSchema>;
export type WebUpdateAppSubmission = z.infer<typeof zWebUpdateAppSubmissionSchema>;
export type AppSubmissionApprove = z.infer<typeof zAppSubmissionApproveSchema>;