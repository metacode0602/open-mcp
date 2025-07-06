import { z } from "zod";

import { searchSchema } from "./common";

// RSS条目创建
export const createRssItemSchema = z.object({
  rssId: z.string(),
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  content: z.string().optional(),
  link: z.string().url("链接格式不正确"),
  guid: z.string(),
  pubDate: z.date(),
});

// RSS条目更新
export const updateRssItemSchema = z.object({
  id: z.string(),
  rssId: z.string().optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  link: z.string().url("链接格式不正确").optional(),
  guid: z.string().optional(),
  pubDate: z.date().optional(),
});

// RSS条目查询
export const getRssItemSchema = z.object({
  id: z.string(),
});

// RSS条目搜索
export const searchRssItemsSchema = searchSchema.extend({
  rssId: z.string().optional(),
});

// RSS条目删除
export const deleteRssItemSchema = z.object({
  id: z.string(),
}); 