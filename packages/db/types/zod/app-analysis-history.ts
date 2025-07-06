import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";

export const zAppAnalysisHistoryStatusSchema = z.enum(["pending", "in_progress", "completed", "stopped", "failed"]);
export const zAppAnalysisHistoryTypeSchema = z.enum(["website", "github"]);

// 应用分析历史记录创建
export const zCreateAppAnalysisHistorySchema = z.object({
  appId: z.string(),
  type: zAppAnalysisHistoryTypeSchema,
  url: z.string(),
  version: z.string().optional(),
  analysisResult: z.record(z.any()),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  readme: z.string().optional(),
  status: zAppAnalysisHistoryStatusSchema.default("pending"),
  message: z.string().optional(),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

// 应用分析历史记录更新
export const zUpdateAppAnalysisHistorySchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  version: z.string().optional(),
  analysisResult: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  readme: z.string().optional(),
  status: zAppAnalysisHistoryStatusSchema.optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

export const zAppAnalysisHistorySchema = zBaseEntitySchema.extend({
  appId: z.string(),
  version: z.string().optional(),
  sourceCode: z.string().optional(),
  analysisResult: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  status: z.string().optional(),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

// 应用分析历史记录搜索
export const zSearchAppAnalysisHistorySchema = zSearchSchema.extend({
  appId: z.string().optional(),
  status: zAppAnalysisHistoryStatusSchema.optional(),
  url: z.string().optional(),
});

export type AppAnalysisHistoryStatus = z.infer<typeof zAppAnalysisHistoryStatusSchema>;
export type AppAnalysisHistoryType = z.infer<typeof zAppAnalysisHistoryTypeSchema>;