import { z } from "zod";
import { searchSchema } from "./common";

// 应用提交状态枚举
export const submissionStatusEnum = z.enum([
  "pending",
  "approved",
  "rejected",
  "in_review"
]);

// 应用提交创建
export const createAppSubmissionSchema = z.object({
  appId: z.string(),
  userId: z.string(),
  status: submissionStatusEnum,
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  version: z.string().optional().nullish(),
  sourceCode: z.string().optional().nullish(),
  features: z.array(z.string()).optional().nullish(),
  tools: z.array(z.string()).optional().nullish(),
  tags: z.array(z.string()).optional().nullish(),
  categories: z.array(z.string()).optional().nullish(),
  notes: z.string().optional(),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
});

// 应用提交更新
export const updateAppSubmissionSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  userId: z.string().optional(),
  status: submissionStatusEnum.optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  sourceCode: z.string().optional(),
  features: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  notes: z.string().optional(),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
});

// 应用提交查询
export const getAppSubmissionSchema = z.object({
  id: z.string(),
});

// 应用提交搜索
export const searchAppSubmissionsSchema = searchSchema.extend({
  appId: z.string().optional(),
  userId: z.string().optional(),
  status: submissionStatusEnum.optional(),
});

// 应用提交删除
export const deleteAppSubmissionSchema = z.object({
  id: z.string(),
}); 

export const zAppSubmissionSchema = createAppSubmissionSchema.extend({
  status: submissionStatusEnum,
  id: z.string(),
});

export type AppSubmission = z.infer<typeof zAppSubmissionSchema>;