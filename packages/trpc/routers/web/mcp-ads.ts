import { adsDataAccess } from "@repo/db/database/admin";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { Ads, zAdsStatusEnum } from "@repo/db/types";

export const mcpAdsRouter = router({
  // 获取广告
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return adsDataAccess.getByIdWithApp(input.id) as unknown as Ads;
  }),

  getListByAppId: publicProcedure
    .input(
      z.object({
        appId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return adsDataAccess.getListByAppId(input.appId);
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: zAdsStatusEnum,
    }))
    .mutation(async ({ input }) => {
      return adsDataAccess.updateStatus(input.id, input.status);
    }),

  getActiveAds: publicProcedure
    .input(
      z.object({
        type: z.enum(["banner", "listing"]).optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      return adsDataAccess.getActiveAds(input.type, input.limit);
    }),

  incrementImpressions: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return adsDataAccess.incrementImpressions(input.id);
    }),

  incrementClicks: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return adsDataAccess.incrementClicks(input.id);
    }),

  getAdPricing: publicProcedure.query(async () => {
    // 这里可以从数据库获取价格，现在先返回固定价格
    return {
      listingAdPrice: 100,
      bannerAdPrice: 200,
    }
  }),
}); 