import { rankingRecordsDataAccess, rankingsDataAccess, appsDataAccess } from "@repo/db/database/admin";
import {
  zCreateRankingRecordSchema,
  zUpdateRankingRecordSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const rankingRecordsRouter = router({
  // 获取排行榜记录
  getByRankingId: adminProcedure
    .input(z.object({ rankingId: z.string() }))
    .query(async ({ input }) => {
      return rankingRecordsDataAccess.getByRankingId(input.rankingId);
    }),

  // 创建排行榜记录
  create: adminProcedure
    .input(zCreateRankingRecordSchema)
    .mutation(async ({ input }) => {
      return rankingRecordsDataAccess.create(input);
    }),

  // 批量创建排行榜记录
  batchCreate: adminProcedure
    .input(z.array(zCreateRankingRecordSchema))
    .mutation(async ({ input }) => {
      // 检查是否有重复的appId
      const appIds = input.map((item) => item.entityId);
      const uniqueAppIds = new Set(appIds);
      if (appIds.length !== uniqueAppIds.size) {
        throw new Error("appId重复");
      }
      // 检查appId是否存在
      const apps = await appsDataAccess.getByIds(appIds);
      if (apps.length !== appIds.length) {
        throw new Error("appId不存在");
      }

      // 检查rankingId是否存在
      const rankingId = input.map((item) => item.rankingId)[0];
      if (!rankingId) {
        throw new Error("rankingId不存在");
      }
      const ranking = await rankingsDataAccess.getById(rankingId);
      if (!ranking) {
        throw new Error("rankingId不存在");
      }

      // 获取当前排行的最大rank
      const existingRecords = await rankingRecordsDataAccess.getByRankingId(rankingId);
      const maxRank = existingRecords.reduce((max, curr) => Math.max(max, curr.rank), 0);

      // 为每个记录设置entityName和rank
      const recordsWithNames = input.map((record, index) => {
        if (record.entityType === "apps") {
          const app = apps.find((app) => app.id === record.entityId);
          if (app) {
            return {
              ...record,
              entityName: app.name,
              rank: maxRank + 1 + index // 每个记录的rank值依次加1
            };
          }
        }
        return record;
      });

      // 批量创建记录
      const createdRecords = await rankingRecordsDataAccess.batchCreate(rankingId, recordsWithNames);

      return createdRecords;
    }),

  // 更新排行榜记录
  update: adminProcedure
    .input(zUpdateRankingRecordSchema)
    .mutation(async ({ input }) => {
      return rankingRecordsDataAccess.update(input);
    }),

  // 批量更新排行榜记录
  batchUpdate: adminProcedure
    .input(z.array(zUpdateRankingRecordSchema))
    .mutation(async ({ input }) => {
      return rankingRecordsDataAccess.batchUpdate(input);
    }),

  // 删除排行榜记录
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return rankingRecordsDataAccess.delete(input.id);
    }),

  // 批量删除排行榜记录
  batchDelete: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      const results = [];
      for (const id of input.ids) {
        const result = await rankingRecordsDataAccess.delete(id);
        results.push(...result);
      }
      return results;
    }),
});