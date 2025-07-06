import { appRssData } from "@repo/db/database/admin";
import {
  zCreateAppRssSchema,
  zSearchAppRssSchema,
  zUpdateAppRssSchema,
} from "@repo/db/types";
import { adminProcedure, router } from "../../trpc";
import { z } from "zod";

export const appRssRouter = router({
  // 创建应用RSS
  create: adminProcedure
    .input(zCreateAppRssSchema)
    .mutation(async ({ input }) => {
      return appRssData.create(input);
    }),

  // 更新应用RSS
  update: adminProcedure
    .input(zUpdateAppRssSchema)
    .mutation(async ({ input }) => {
      return appRssData.update(input.id, { ...input });
    }),

  // 获取应用RSS
  getById: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return appRssData.getById(input.id);
    }),

  // 搜索应用RSS
  search: adminProcedure
    .input(zSearchAppRssSchema)
    .query(async ({ input }) => {
      return appRssData.search(input);
    }),

  // 删除应用RSS
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      return appRssData.delete(input.id);
    }),
});