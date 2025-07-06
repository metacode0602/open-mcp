import { adsDataAccess } from "@repo/db/database/admin";
import {
  zAdsStatusEnum,
  zCreateAdsSchema,
  zSearchAdsSchema,
  zUpdateAdsSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const adsRouter = router({
  // 创建广告
  create: adminProcedure.input(zCreateAdsSchema).mutation(async ({ ctx, input }) => {
    return adsDataAccess.create(input, ctx.user.id);
  }),

  // 更新广告
  update: adminProcedure.input(zUpdateAdsSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;
    return adsDataAccess.update(id, data, ctx.user.id);
  }),

  // 获取广告
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return adsDataAccess.getById(input.id);
  }),

  // 搜索广告
  search: adminProcedure.input(zSearchAdsSchema).query(async ({ input }) => {
    return adsDataAccess.search(input);
  }),

  // 删除广告
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return adsDataAccess.delete(input.id);
  }),

  getListByAppId: adminProcedure
    .input(
      z.object({
        appId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return adsDataAccess.getListByAppId(input.appId);
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: zAdsStatusEnum,
    }))
    .mutation(async ({ input }) => {
      return adsDataAccess.updateStatus(input.id, input.status);
    }),

  getListByUserId: adminProcedure
    .input(z.object({
      userId: z.string(),
    })).query(async ({ input }) => {
      return adsDataAccess.getAdsByUserId(input.userId);
    }),
}); 