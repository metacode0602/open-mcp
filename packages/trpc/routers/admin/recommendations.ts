import { appsDataAccess, recommendationAppData, recommendationDataAccess } from "@repo/db/database/admin";
import {
  zCreateRecommendationSchema,
  zSearchRecommendationsSchema,
  zUpdateRecommendationSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const recommendationsRouter = router({
  // 创建推荐
  create: adminProcedure
    .input(zCreateRecommendationSchema)
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.create(input);
    }),

  // 更新推荐
  update: adminProcedure
    .input(zUpdateRecommendationSchema)
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.update(input.id, input);
    }),

  // 获取推荐
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await recommendationDataAccess.getById(input.id);
    }),

  // 搜索推荐
  search: adminProcedure
    .input(zSearchRecommendationsSchema)
    .query(async ({ input }) => {
      return await recommendationDataAccess.search(input);
    }),

  list: adminProcedure
    .input(zSearchRecommendationsSchema)
    .query(async ({ input }) => {
      return await recommendationDataAccess.search(input);
    }),
  // 删除推荐
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.delete(input.id);
    }),

  // 获取推荐中的应用列表
  getAppsByRecommendationId: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await recommendationAppData.getAppsByRecommendationId(input.id);
    }),

  // 添加应用到推荐
  addApp: adminProcedure
    .input(z.object({
      recommendationId: z.string(),
      appIds: z.array(z.string()),
      order: z.coerce.number(),
    }))
    .mutation(async ({ input }) => {
      const appIds = await appsDataAccess.getByIds(input.appIds);
      if (appIds.length !== input.appIds.length) {
        throw new Error("Some apps do not exist");
      }
      return await recommendationAppData.createBatch(input.recommendationId, input.appIds, input.order);
    }),

  // 从推荐中删除应用
  deleteApp: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await recommendationAppData.delete(input.id);
    }),

  // 更新应用排序
  updateAppOrder: adminProcedure
    .input(z.object({
      id: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await recommendationAppData.update(input.id, input.order);
    }),
}); 