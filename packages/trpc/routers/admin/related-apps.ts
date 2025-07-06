import { relatedAppDataAccess } from "@repo/db/database/admin";
import {
  zCreateRelatedAppSchema,
  zSearchRelatedAppsSchema,
  zUpdateRelatedAppSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const relatedAppsRouter = router({
  // 创建相关应用
  create: adminProcedure
    .input(zCreateRelatedAppSchema)
    .mutation(async ({ input }) => {
      return await relatedAppDataAccess.create(input);
    }),

  // 更新相关应用
  update: adminProcedure
    .input(zUpdateRelatedAppSchema)
    .mutation(async ({ input }) => {
      return await relatedAppDataAccess.update(input.id, input);
    }),

  // 获取相关应用
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await relatedAppDataAccess.getById(input.id);
    }),

  // 搜索相关应用
  search: adminProcedure
    .input(zSearchRelatedAppsSchema)
    .query(async ({ input }) => {
      return await relatedAppDataAccess.search(input);
    }),

  // 删除相关应用
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await relatedAppDataAccess.delete(input.id);
    }),
}); 