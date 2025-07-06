import { z } from "zod";
import { searchSchema } from "./common";

// 应用分析历史记录创建
export const createAppAnalysisHistorySchema = z.object({
  appId: z.string(),
  version: z.string().optional(),
  sourceCode: z.string().optional(),
  analysisResult: z.record(z.any()),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  status: z.string().default("completed"),
  error: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

// 应用分析历史记录更新
export const zUpdateAppAnalysisHistorySchema = z.object({
  id: z.string(),
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
  userId: z.string().optional(),
});

export type UpdateAppAnalysisHistory = z.infer<typeof zUpdateAppAnalysisHistorySchema>;

// 应用分析历史记录查询
export const getAppAnalysisHistorySchema = z.object({
  id: z.string(),
});

// 应用分析历史记录搜索
export const searchAppAnalysisHistorySchema = searchSchema.extend({
  appId: z.string().optional(),
  status: z.string().optional(),
});

// 应用分析历史记录删除
export const deleteAppAnalysisHistorySchema = z.object({
  id: z.string(),
});

export const zAppAnalysisHistorySchema = z.object({
  id: z.string(),
  appId: z.string(),
  version: z.string(),
  sourceCode: z.string(), // 源码内容或URL
  analysisResult: z.record(z.any()), // 分析结果
  features: z.array(z.string()), // 提取的特征
  tools: z.record(z.any()), // 提取的工具
  tags: z.array(z.string()), // 提取的标签
  categories: z.array(z.string()), // 提取的分类
  status: z.string().default("pending"), // 分析状态
  error: z.string().optional(), // 错误信息
  startTime: z.date(),
  endTime: z.date(),
  createdAt: z.date(),
});

export type AppAnalysisHistory = z.infer<typeof zAppAnalysisHistorySchema>;