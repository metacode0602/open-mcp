import { recommendationAppData, recommendationDataAccess } from "@repo/db/database/admin";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const mcpRecommendationsRouter = router({
  // 获取推荐应用
  getRecommendedAppsByType: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      let id = "";
      if (input.type === "client") {
        id = process.env.NEXT_CLIENT_RECOMMENDATION_ID ?? ""
      } else if (input.type === "server") {
        id = process.env.NEXT_SERVER_RECOMMENDATION_ID ?? "";
      } else {
        id = process.env.NEXT_APP_RECOMMENDATION_ID ?? "";
      }
      if (id.trim().length > 0) {
        const recommendationApps = await recommendationDataAccess.getAppsByRecommendationId(id, input.limit ?? 10);
        // 提取 app 数据
        return recommendationApps.map((item) => item.app);

      } else {
        return []
      }
    }),

  // 获取推荐应用
  getFeaturedApps: publicProcedure
    .input(
      z.object({
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const id = process.env.NEXT_FEATURED_RECOMMENDATION_ID ?? "";
      const recommendationApps = await recommendationDataAccess.getAppsByRecommendationId(id, input.limit ?? 10);
      // 提取 app 数据
      return recommendationApps.map((item) => item.app);
      // return await recommendationAppData.getFeaturedApps(input.limit ?? 10);
    }),

  getAppRecommendedApps: publicProcedure
    .input(
      z.object({
        appId: z.string(), //当前正在访问的appid
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await recommendationAppData.getAppRecommendedApps(input.appId, input.limit ?? 10);
    }),
}); 