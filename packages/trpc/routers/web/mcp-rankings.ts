import { rankingsDataAccess } from "@repo/db/database/admin";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { createDateFromParams, formatPeriodKey, getDayofWeekInYear } from "@repo/db/types";

export const mcpRankingsRouter = router({
  // 获取指定类型和日期的排行数据
  getRankingApps: publicProcedure
    .input(z.object({
      type: z.enum(["daily", "weekly", "monthly", "yearly"]),
      year: z.number(),
      month: z.number().optional(),
      day: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const date = createDateFromParams(input.year, input.month, input.day);
      const periodKey = formatPeriodKey(input.type, date);
      console.info("getRankingApps getDayofWeekInYear: ", getDayofWeekInYear(date));
      console.info("getRankingApps", { type: input.type, year: input.year, month: input.month, day: input.day, periodKey });
      const ranking = await rankingsDataAccess.findOne({
        type: input.type,
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),

  // 获取今日排行
  getTodayRankingApps: publicProcedure
    .query(async () => {
      const periodKey = formatPeriodKey('daily');
      const ranking = await rankingsDataAccess.findOne({
        type: "daily",
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),

  // 获取昨日排行
  getYesterdayRankingApps: publicProcedure
    .query(async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const periodKey = formatPeriodKey('daily', yesterday);

      const ranking = await rankingsDataAccess.findOne({
        type: "daily",
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),

  // 获取本周排行
  getWeeklyRankingApps: publicProcedure
    .query(async () => {
      const today = new Date();
      const periodKey = formatPeriodKey('weekly', today);

      const ranking = await rankingsDataAccess.findOne({
        type: "weekly",
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),

  // 获取本月排行
  getMonthlyRankingApps: publicProcedure
    .query(async () => {
      const today = new Date();
      const periodKey = formatPeriodKey('monthly', today);

      const ranking = await rankingsDataAccess.findOne({
        type: "monthly",
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),

  // 获取历史排行数据
  getHistoricalRankingApps: publicProcedure
    .input(z.object({
      type: z.enum(["daily", "weekly", "monthly", "yearly"]),
      year: z.number(),
      month: z.number().optional(),
      day: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const date = createDateFromParams(input.year, input.month, input.day);
      const periodKey = formatPeriodKey(input.type, date);

      const ranking = await rankingsDataAccess.findOne({
        type: input.type,
        source: "github",
        periodKey,
      });

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),
});