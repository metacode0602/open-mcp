import { and, asc, desc, eq, like, or, sql, gte, lte } from "drizzle-orm";
import { db } from "../../index";
import { snapshots, snapshotsMonthly, snapshotsWeekly, apps } from "../../schema";

export const snapshotsDataAccess = {
  /**
   * 获取指定应用过去一年中的stars数据，按月分组
   * 返回一个数组，每个元素包含year, month, stars
   */
  findStarsByAppIdOfLastYear: async (repoId: string): Promise<{ year: number; month: number; stars: number; delta: number }[]> => {
    if (!repoId || repoId.trim() === "") {
      return [];
    }

    // 计算一年前的日期
    const now = new Date();

    // 查询过去一年的月度快照数据
    const monthlySnapshotsData = await db
      .select({
        year: snapshotsMonthly.year,
        month: snapshotsMonthly.month,
        stars: snapshotsMonthly.stars,
      })
      .from(snapshotsMonthly)
      .where(
        and(
          eq(snapshotsMonthly.repoId, repoId),
          // gte(snapshotsMonthly.createdAt, oneYearAgo),
          // lte(snapshotsMonthly.createdAt, now)
        )
      )
      .orderBy(desc(snapshotsMonthly.year), desc(snapshotsMonthly.month)).limit(12);

    // 转换为数组并计算delta
    const result = monthlySnapshotsData
      .map((item, index, array) => {
        const delta = index > 0 ? (array[index - 1]?.stars ?? 0) - (item.stars ?? 0) : 0;
        return {
          year: item.year,
          month: item.month,
          stars: item.stars ?? 0,
          delta,
        };
      });
    console.info("[snapshots.ts] [findStarsByAppIdOfLastYear] result", result, monthlySnapshotsData);
    return result;
  },

  /**
   * 获取指定应用的trends数据，用于计算不同时间段的平均增长
   * 使用更高效的方法，基于year/month/day/week字段而不是createdAt
   */
  getProjectTrends: async (repoId: string): Promise<{ daily: number; weekly: number; monthly: number; yearly: number }> => {
    if (!repoId || repoId.trim() === "") {
      return { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() 返回 0-11

    // // 计算昨天的日期
    // const yesterday = new Date(now);
    // yesterday.setDate(yesterday.getDate() - 1);


    // // 计算上周的日期
    // const lastWeek = new Date(now);
    // lastWeek.setDate(lastWeek.getDate() - 7);


    // 计算上月的日期
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthYear = lastMonth.getFullYear();
    const lastMonthMonth = lastMonth.getMonth() + 1;

    // 计算去年最后一个月
    const lastYear = currentYear - 1;
    const lastYearLastMonth = 12;

    // 获取今日数据
    const last2DaysSnapshot = await db
      .select({ stars: snapshots.stars })
      .from(snapshots)
      .where(
        and(
          eq(snapshots.repoId, repoId),
          eq(snapshots.year, currentYear),
          eq(snapshots.month, currentMonth),
        )
      )
      .orderBy(desc(snapshots.year), desc(snapshots.month), desc(snapshots.day)).limit(2);


    // 获取最近2周数据
    const current2WeekSnapshot = await db
      .select({ stars: snapshotsWeekly.stars })
      .from(snapshotsWeekly)
      .where(
        and(
          eq(snapshotsWeekly.repoId, repoId),
          eq(snapshotsWeekly.year, currentYear),
        )
      )
      .orderBy(desc(snapshotsWeekly.year), desc(snapshotsWeekly.week)).limit(2);


    // 获取上月数据
    const lastMonthSnapshot = await db
      .select({ stars: snapshotsMonthly.stars })
      .from(snapshotsMonthly)
      .where(
        and(
          eq(snapshotsMonthly.repoId, repoId),
          eq(snapshotsMonthly.year, lastMonthYear),
          eq(snapshotsMonthly.month, lastMonthMonth)
        )
      )
      .orderBy(desc(snapshotsMonthly.createdAt))
      .limit(1);

    // 获取去年最后一个月数据
    const lastYearLastMonthSnapshot = await db
      .select({ stars: snapshotsMonthly.stars })
      .from(snapshotsMonthly)
      .where(
        and(
          eq(snapshotsMonthly.repoId, repoId),
          eq(snapshotsMonthly.year, lastYear),
          eq(snapshotsMonthly.month, lastYearLastMonth)
        )
      )
      .orderBy(desc(snapshotsMonthly.createdAt))
      .limit(1);

    const todayStars = last2DaysSnapshot.length == 2 ? (last2DaysSnapshot[1]?.stars ?? 0) : last2DaysSnapshot.length == 1 ? (last2DaysSnapshot[0]?.stars ?? 0) : 0;
    const yesterdayStars = last2DaysSnapshot.length == 2 ? (last2DaysSnapshot[0]?.stars ?? 0) : last2DaysSnapshot.length == 1 ? (last2DaysSnapshot[0]?.stars ?? 0) : 0;
    const currentWeekStars = current2WeekSnapshot.length == 2 ? (current2WeekSnapshot[1]?.stars ?? 0) : current2WeekSnapshot.length == 1 ? (current2WeekSnapshot[0]?.stars ?? 0) : 0;
    const lastWeekStars = current2WeekSnapshot.length == 2 ? (current2WeekSnapshot[0]?.stars ?? 0) : current2WeekSnapshot.length == 1 ? (current2WeekSnapshot[0]?.stars ?? 0) : 0;
    const lastMonthStars = lastMonthSnapshot[0]?.stars ?? 0;
    const lastYearLastMonthStars = lastYearLastMonthSnapshot[0]?.stars ?? 0;

    return {
      daily: todayStars - yesterdayStars, // 今日与昨日数据之差
      weekly: currentWeekStars - lastWeekStars, // 本周与上周数据之差
      monthly: yesterdayStars - lastMonthStars, // 昨日与上月数据之差
      yearly: todayStars - lastYearLastMonthStars, // 今日与去年最后一个月数据之差
    };
  },
}; 