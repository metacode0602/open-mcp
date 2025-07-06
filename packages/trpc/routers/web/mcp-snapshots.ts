import { snapshotsDataAccess } from "@repo/db/database/admin";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const mcpSnapshotsRouter = router({
  // 获取指定应用过去一年中的stars数据，按月分组
  getSnapshotsByAppId: publicProcedure
    .input(z.object({
      repoId: z.string(),
    }))
    .query(async ({ input }) => {
      // 获取指定appId的过去一年中的stars数据，按月分组，返回一个数组，每个元素包含year, month, stars, delta
      const snapshots = await snapshotsDataAccess.findStarsByAppIdOfLastYear(input.repoId);
      return snapshots;
    }),

  // 获取指定应用的trends数据，用于计算不同时间段的平均增长
  getProjectTrends: publicProcedure
    .input(z.object({
      repoId: z.string(),
    }))
    .query(async ({ input }) => {
      // 获取指定appId的trends数据，包含daily, weekly, monthly, yearly的增长数据
      const trends = await snapshotsDataAccess.getProjectTrends(input.repoId);
      return trends;
    }),
});