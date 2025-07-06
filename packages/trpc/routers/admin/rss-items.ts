import { rssItemData } from "@repo/db/database/admin";
import {
  zCreateRssItemSchema,
  zSearchRssItemsSchema,
  zUpdateRssItemSchema,
} from "@repo/db/types";
import { adminProcedure, router } from "../../trpc";
import { z } from "zod";

export const rssItemsRouter = router({
  // 创建RSS条目
  create: adminProcedure
    .input(zCreateRssItemSchema)
    .mutation(async ({ input }) => {
      return rssItemData.create(input);
    }),

  // 更新RSS条目
  update: adminProcedure
    .input(zUpdateRssItemSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return rssItemData.update(id, data);
    }),

  // 获取RSS条目
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return rssItemData.getById(input.id);
    }),

  // 搜索RSS条目
  search: adminProcedure
    .input(zSearchRssItemsSchema)
    .query(async ({ input }) => {
      return rssItemData.search(input);
    }),

  // 删除RSS条目
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return rssItemData.delete(input.id);
    }),
}); 