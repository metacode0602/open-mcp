import { z } from "zod";
import { searchSchema } from "./common";

// 枚举类型定义
export const appTypeEnum = z.enum(["client", "server", "application"]);
export const appSourceEnum = z.enum(["automatic", "submitted", "admin"]);
export const appStatusEnum = z.enum(["pending", "approved", "rejected", "archived"]);

export type AppType = z.infer<typeof appTypeEnum>;
export type AppSource = z.infer<typeof appSourceEnum>;
export type AppStatus = z.infer<typeof appStatusEnum>;

// 应用创建
export const createAppSchema = z.object({
  slug: z.string().min(1, "Slug不能为空"),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  longDescription: z.string().optional(),
  type: appTypeEnum,
  icon: z.string().optional(),
  website: z.string().url("网站格式不正确").optional().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().or(z.literal("")),
  version: z.string().optional(),
  license: z.string().optional(),
  scenario: z.string().optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  banner: z.string().optional(),
  source: appSourceEnum.optional(),
});

// 应用更新
export const updateAppSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  longDescription: z.string().optional(),
  type: appTypeEnum.optional(),
  source: appSourceEnum.optional(),
  status: appStatusEnum.optional(),
  analysed: z.boolean().optional(),
  icon: z.string().optional(),
  website: z.string().url("网站格式不正确").optional().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().or(z.literal("")),
  version: z.string().optional(),
  license: z.string().optional(),
  featured: z.boolean().optional(),
  scenario: z.string().optional(),
  forks: z.number().int().optional(),
  issues: z.number().int().optional(),
  pullRequests: z.number().int().optional(),
  contributors: z.number().int().optional(),
  lastCommit: z.date().optional(),
  supportedServers: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  verified: z.boolean().optional(),
});

// 应用查询
export const getAppSchema = z.object({
  id: z.string(),
});

// 应用搜索
export const searchAppsSchema = searchSchema.extend({
  type: appTypeEnum.optional(),
  source: appSourceEnum.optional(),
  status: appStatusEnum.optional(),
  analysed: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  ownerId: z.string().optional(),
});

// 应用删除
export const deleteAppSchema = z.object({
  id: z.string(),
}); 