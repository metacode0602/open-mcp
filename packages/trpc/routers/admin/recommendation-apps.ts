import { recommendationAppData } from "@repo/db/database/admin";
import {
  zCreateRecommendationAppSchema,
  zSearchRecommendationAppsSchema,
  zUpdateRecommendationAppSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const recommendationAppsRouter = router({
  // 创建推荐应用关联
  create: adminProcedure
    .input(zCreateRecommendationAppSchema)
    .mutation(async ({ input }) => {
      return await recommendationAppData.create(input);
    }),

  // 更新推荐应用关联
  update: adminProcedure
    .input(zUpdateRecommendationAppSchema)
    .mutation(async ({ input }) => {
      // @ts-expect-error
      return await recommendationAppData.update(input.id, input);
    }),

  // 获取推荐应用关联
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await recommendationAppData.getById(input.id);
    }),

  // 搜索推荐应用关联
  search: adminProcedure
    .input(zSearchRecommendationAppsSchema)
    .query(async ({ input }) => {
      return await recommendationAppData.search(input);
    }),

  // 删除推荐应用关联
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await recommendationAppData.delete(input.id);
    }),
}); 