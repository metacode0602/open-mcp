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
      const today = new Date();
      const periodKey = formatPeriodKey('daily', today);

      let ranking = await rankingsDataAccess.findOne({
        type: "daily",
        source: "github",
        periodKey,
      });

      // 如果排行不存在，尝试从快照数据计算
      if (!ranking) {
        console.info("今日排行不存在，尝试从快照数据计算");
        const calculatedRanking = await rankingsDataAccess.calculateDailyRankingFromSnapshots(today);
        if (calculatedRanking) {
          ranking = calculatedRanking;
        }
      }

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

      let ranking = await rankingsDataAccess.findOne({
        type: "daily",
        source: "github",
        periodKey,
      });

      // 如果排行不存在，尝试从快照数据计算
      if (!ranking) {
        console.info("昨日排行不存在，尝试从快照数据计算");
        const calculatedRanking = await rankingsDataAccess.calculateDailyRankingFromSnapshots(yesterday);
        if (calculatedRanking) {
          ranking = calculatedRanking;
        }
      }

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

      let ranking = await rankingsDataAccess.findOne({
        type: "weekly",
        source: "github",
        periodKey,
      });

      // 如果排行不存在，尝试从快照数据计算
      if (!ranking) {
        console.info("本周排行不存在，尝试从快照数据计算");
        const calculatedRanking = await rankingsDataAccess.calculateWeeklyRankingFromSnapshots(today);
        if (calculatedRanking) {
          ranking = calculatedRanking;
        }
      }

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

      let ranking = await rankingsDataAccess.findOne({
        type: "monthly",
        source: "github",
        periodKey,
      });

      // 如果排行不存在，尝试从快照数据计算
      if (!ranking) {
        console.info("本月排行不存在，尝试从快照数据计算");
        const calculatedRanking = await rankingsDataAccess.calculateMonthlyRankingFromSnapshots(today);
        if (calculatedRanking) {
          ranking = calculatedRanking;
        }
      }

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

      let ranking = await rankingsDataAccess.findOne({
        type: input.type,
        source: "github",
        periodKey,
      });

      // 如果排行不存在，尝试从快照数据计算
      if (!ranking) {
        console.info(`历史排行不存在，尝试从快照数据计算: ${input.type} ${periodKey}`);

        switch (input.type) {
          case 'daily':
            const dailyRanking = await rankingsDataAccess.calculateDailyRankingFromSnapshots(date);
            if (dailyRanking) {
              ranking = dailyRanking;
            }
            break;
          case 'weekly':
            const weeklyRanking = await rankingsDataAccess.calculateWeeklyRankingFromSnapshots(date);
            if (weeklyRanking) {
              ranking = weeklyRanking;
            }
            break;
          case 'monthly':
            const monthlyRanking = await rankingsDataAccess.calculateMonthlyRankingFromSnapshots(date);
            if (monthlyRanking) {
              ranking = monthlyRanking;
            }
            break;
          case 'yearly':
            // 年排行暂时不支持从快照计算
            break;
        }
      }

      if (!ranking) {
        return [];
      }

      return rankingsDataAccess.getRankingAppsByRankingId(ranking.id);
    }),
});