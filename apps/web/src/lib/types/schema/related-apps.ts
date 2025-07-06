import { z } from "zod";
import { searchSchema } from "./common";

// 相关应用创建
export const createRelatedAppSchema = z.object({
  appId: z.string(),
  relatedAppId: z.string(),
  similarity: z.number().optional(),
});

// 相关应用更新
export const updateRelatedAppSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  relatedAppId: z.string().optional(),
  similarity: z.number().optional(),
});

// 相关应用查询
export const getRelatedAppSchema = z.object({
  id: z.string(),
});

// 相关应用搜索
export const searchRelatedAppsSchema = searchSchema.extend({
  appId: z.string().optional(),
  relatedAppId: z.string().optional(),
});

// 相关应用删除
export const deleteRelatedAppSchema = z.object({
  id: z.string(),
}); 