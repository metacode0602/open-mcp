
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { relatedAppDataAccess } from "@repo/db/database/admin";

export const mcpRelatedAppsRouter = router({
  // 获取相关应用
  getRelatedApps: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        appId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await relatedAppDataAccess.getRelatedApps(input);
    }),

  getRecommendedApps: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        appId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await relatedAppDataAccess.getRecommendedApps(input);
    }),
}); 