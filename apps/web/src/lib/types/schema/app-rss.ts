import { z } from "zod";
import { searchSchema } from "./common";

// 应用RSS创建
export const createAppRssSchema = z.object({
  appId: z.string(),
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  feedUrl: z.string().url("Feed URL格式不正确"),
  lastFetched: z.date().optional(),
  lastUpdated: z.date().optional(),
  isActive: z.boolean().optional(),
});

// 应用RSS更新
export const updateAppRssSchema = z.object({
  id: z.string(),
  appId: z.string().optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
  feedUrl: z.string().url("Feed URL格式不正确").optional(),
  lastFetched: z.date().optional(),
  lastUpdated: z.date().optional(),
  isActive: z.boolean().optional(),
});

// 应用RSS查询
export const getAppRssSchema = z.object({
  id: z.string(),
});

// 应用RSS搜索
export const searchAppRssSchema = searchSchema.extend({
  appId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// 应用RSS删除
export const deleteAppRssSchema = z.object({
  id: z.string(),
}); 