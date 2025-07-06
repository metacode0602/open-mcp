import { z } from "zod";
import { zSearchSchema } from "./common";

// RSS条目创建
export const zCreateRssItemSchema = z.object({
  rssId: z.string(),
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  content: z.string().optional(),
  link: z.string().url("链接格式不正确"),
  guid: z.string(),
  pubDate: z.date(),
});

export const zRssItemSchema = zCreateRssItemSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// RSS条目更新
export const zUpdateRssItemSchema = z.object({
  id: z.string(),
  rssId: z.string().optional(),
  title: z.string().min(1, "标题不能为空").optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  link: z.string().url("链接格式不正确").optional(),
  guid: z.string().optional(),
  pubDate: z.date().optional(),
});


// RSS条目搜索
export const zSearchRssItemsSchema = zSearchSchema.extend({
  rssId: z.string().optional(),
});

export type RssItem = z.infer<typeof zRssItemSchema>;
export type CreateRssItem = z.infer<typeof zCreateRssItemSchema>;
export type UpdateRssItem = z.infer<typeof zUpdateRssItemSchema>;
export type SearchRssItems = z.infer<typeof zSearchRssItemsSchema>;
