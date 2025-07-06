import { z } from "zod";
import { zPublishStatusEnum, zSearchSchema } from "./common";
import { zTagSchema } from "./tags";

// 枚举类型定义
export const zAppTypeEnum = z.enum(["client", "server", "application"]);
export const zAppSourceEnum = z.enum(["automatic", "submitted", "admin"]);
export const zAppStatusEnum = z.enum(["pending", "approved", "rejected", "archived"]);

export type AppType = z.infer<typeof zAppTypeEnum>;
export type AppSource = z.infer<typeof zAppSourceEnum>;
export type AppStatus = z.infer<typeof zAppStatusEnum>;

// 服务器工具类型
export const ServerToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  usage: z.string().optional(),
  examples: z.array(z.string()).optional(),
  parameters: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        required: z.boolean().optional(),
        default: z.union([z.string(), z.number(), z.boolean()]).optional(),
      }),
    )
    .optional(),
  returns: z
    .object({
      type: z.string(),
      description: z.string(),
    })
    .optional(),
});

export type ServerTool = z.infer<typeof ServerToolSchema>;

// 应用创建
export const zCreateAppSchema = z.object({
  slug: z.string().min(1, "Slug不能为空"),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  longDescription: z.string().optional(),
  type: zAppTypeEnum,
  icon: z.string().optional(),
  website: z.string().url("网站格式不正确").optional().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().or(z.literal("")),
  version: z.string().optional(),
  license: z.string().optional(),
  scenario: z.string().optional(),
  features: z.array(z.string()).optional(),
  tools: z.array(ServerToolSchema).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  banner: z.string().optional(),
  source: zAppSourceEnum.optional(),
  publishStatus: zPublishStatusEnum.optional(),
});

export const zAppSchema = zCreateAppSchema.extend({
  id: z.string(),
  slug: z.string().min(1, "Slug不能为空"),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  descriptionZh: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  type: zAppTypeEnum,
  icon: z.string().optional().nullable(),
  pics: z.array(z.string()).optional().nullable(),
  stars: z.number().int().optional().nullable(),
  website: z.string().url("网站格式不正确").optional().nullable().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().nullable().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().nullable().or(z.literal("")),
  version: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  scenario: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  tools: z.array(ServerToolSchema).optional().nullable(),
  ownerId: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(), // ownerName + repoName
  categoryIds: z.array(z.string()).optional().nullable(),
  tagIds: z.array(z.string()).optional().nullable(),
  banner: z.string().optional().nullable(),
  source: zAppSourceEnum.optional().default("admin"),
  featured: z.boolean().default(false),
  status: zAppStatusEnum.optional().default("pending"),
  publishStatus: zPublishStatusEnum.optional().default("offline"),
  verified: z.boolean().nullable().default(false),
  createdAt: z.date(),
  repoCreatedAt: z.date().optional().nullable(), // github 创建时间
  lastCommit: z.date().optional().nullable(), // 最后提交时间
  contributors: z.number().int().optional().nullable(), // 贡献者数量
  commits: z.number().int().optional().nullable(), // 提交次数
  updatedAt: z.date().optional().nullable(),
  primaryLanguage: z.string().optional().nullable(),
  repoId: z.string().optional().nullable(),
});

export const zAppAnalysisSchema = z.object({
  id: z.string(),
  longDescription: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  pics: z.array(z.string()).optional().nullable(),
  stars: z.number().int().optional(),
  banner: z.string().optional().nullable(),
  tags: z.array(zTagSchema),
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
});

// 应用更新
export const zUpdateAppSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  longDescription: z.string().optional(),
  type: zAppTypeEnum.optional(),
  source: zAppSourceEnum.optional(),
  status: zAppStatusEnum.optional(),
  analysed: z.boolean().optional(),
  icon: z.string().optional(),
  banner: z.string().optional(),
  pics: z.array(z.string()).optional(),
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
  readme: z.string().optional(),
});

// 应用搜索
export const zSearchAppsSchema = zSearchSchema.extend({
  type: zAppTypeEnum.optional(),
  source: zAppSourceEnum.optional(),
  status: zAppStatusEnum.optional(),
  analysed: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  ownerId: z.string().optional(),
});

export type App = z.infer<typeof zAppSchema>;
export type CreateApp = z.infer<typeof zCreateAppSchema>;
export type UpdateApp = z.infer<typeof zUpdateAppSchema>;
export type SearchApps = z.infer<typeof zSearchAppsSchema>;

/**
 * 以下为 web 端使用的类型定义
 * 
 */

export const zMcpAppSchema = zAppSchema.extend({
  upvotes: z.number().int().optional(),
  status: zAppStatusEnum.optional(),
  deployable: z.boolean().nullable().default(false),
  tags: z.array(zTagSchema).nullish(),
});

export type McpApp = z.infer<typeof zMcpAppSchema>;

export const zRepositoryDetailSchema = z.object({
  readme: z.string(),
  longDescription: z.string().optional(),
  issues: z.number().default(0),
  favicon: z.string().default(''),
  version: z.string().default(''),
  openGraphImageUrl: z.string().default(''),
  watchers: z.number().default(0),
  description: z.string().default(''),
  features: z.array(z.string()).default([]),
  pullRequests: z.number().default(0),
  primaryLanguage: z.string().default(''),
  languages: z.array(z.string()).default([]),
  lastCommit: z.string().default("0"),
  lastCommitMessage: z.string().default(''),
  lastCommitAuthor: z.string().default(''),
  lastCommitDate: z.string().default(''),
  commits: z.number().default(0),
  license: z.string().default(''),
  stars: z.number().default(0),
  forks: z.number().default(0),
  releases: z.number().default(0),
  contributors: z.number().default(0),
  topics: z.array(z.string()).default([]),
});

export type RepositoryDetail = z.infer<typeof zRepositoryDetailSchema>;