import { z } from "zod";
import { zSearchSchema } from "./common";

// 枚举类型定义
export const zRankingSourceEnum = z.enum(["github", "openmcp", "producthunt"]);
export const zRankingTypeEnum = z.enum(["daily", "weekly", "monthly", "yearly"]);
// 标签创建
export const zCreateRankingSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  source: zRankingSourceEnum,
  type: zRankingTypeEnum,
  periodKey: z.string(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
});

export const zRankingSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空"),
  source: zRankingSourceEnum,
  type: zRankingTypeEnum,
  periodKey: z.string(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date(),
});

// 标签更新
export const zUpdateRankingSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().optional(),
});

// 标签搜索
export const zSearchRankingsSchema = zSearchSchema.extend({
  source: zRankingSourceEnum.optional(),
});

export type RankingSource = z.infer<typeof zRankingSourceEnum>;
export type CreateRanking = z.infer<typeof zCreateRankingSchema>;
export type UpdateRanking = z.infer<typeof zUpdateRankingSchema>;
export type SearchRankings = z.infer<typeof zSearchRankingsSchema>;

export type Ranking = z.infer<typeof zRankingSchema>;
export type RankingType = z.infer<typeof zRankingTypeEnum>;

// 辅助函数：格式化周期键
export function formatPeriodKey(type: string, date?: Date): string {
  const targetDate = date || new Date();
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const week = getDayofWeekInYear(targetDate); // 获取当前日期所在周的周数
  console.info("formatPeriodKey", { type, year, month, day, week });

  switch (type) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      return `${year}-W${week}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'yearly':
      return `${year}`;
    default:
      throw new Error('Invalid period type');
  }
}

// 辅助函数：从日期参数创建Date对象
export function createDateFromParams(year: number, month?: number, day?: number): Date {
  const date = new Date();
  date.setFullYear(year);
  if (month !== undefined) {
    date.setMonth(month - 1);
    if (day !== undefined) {
      date.setDate(day);
    }
  }
  return date;
}

/**
 * 获取当前日期输入本月的第几周，但是有个问题，如果 遇到跨周的时候，会有问题，
 * 所以，最好还是计算当前日期属于本年的第几周
 * @param date 
 * @returns 
 */
export const getDayInWeek = (date: Date) => {
  // 获取日期所在的年和月
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  // 获取当前日期所在周的周一
  const currentDate = new Date(date)
  const dayOfWeek = currentDate.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // 周日时 dayOfWeek 为 0，需特殊处理
  currentDate.setDate(currentDate.getDate() + diff)

  // 获取周的开始和结束日期
  const weekStart = new Date(currentDate)
  const weekEnd = new Date(currentDate)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // 获取开始和结束日期的年月信息
  const startYear = weekStart.getFullYear()
  const startMonth = weekStart.getMonth() + 1
  const endYear = weekEnd.getFullYear()
  const endMonth = weekEnd.getMonth() + 1

  // 根据是否跨月份或跨年来格式化显示
  let formattedStart = `${startMonth}月${weekStart.getDate()}日`
  let formattedEnd = `${endMonth}月${weekEnd.getDate()}日`

  if (startYear !== endYear) {
    formattedStart = `${startYear}年${formattedStart}`
    formattedEnd = `${endYear}年${formattedEnd}`
  } else if (startMonth !== endMonth) {
    formattedStart = `${startMonth}月${weekStart.getDate()}日`
    formattedEnd = `${endMonth}月${weekEnd.getDate()}日`
  }

  // 计算当月第一天
  const firstDayOfMonth = new Date(year, month - 1, 1)

  // 获取当月第一天是星期几（0是星期日，1-6是星期一到星期六）
  const firstDayWeekDay = firstDayOfMonth.getDay()

  // 计算当月第一个星期一的日期
  // 如果第一天是星期日，则需要后移1天；如果是其他日子，需要移动到下一个星期一
  const daysToFirstMonday = firstDayWeekDay === 0 ? 1 : (8 - firstDayWeekDay)
  const firstMondayDate = new Date(year, month - 1, 1 + daysToFirstMonday - 1)

  // 计算给定日期在月份中的第几周
  // 如果给定日期在第一个星期一之前，则为第一周
  if (date < firstMondayDate) {
    return {
      start: weekStart.getDate().toString().padStart(2, "0"),
      end: weekEnd.getDate().toString().padStart(2, "0"),
      display: `${formattedStart}—${formattedEnd}`,
      weekNumber: 1
    }
  }

  // 计算给定日期与第一个星期一相差的天数，并计算周数
  const daysDiff = Math.floor((date.getTime() - firstMondayDate.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.floor(daysDiff / 7) + 2 // +2是因为第一个星期一之前的日期算第一周

  return {
    start: weekStart.getDate().toString().padStart(2, "0"),
    end: weekEnd.getDate().toString().padStart(2, "0"),
    display: `${formattedStart}—${formattedEnd}`,
    weekNumber
  }
}

// 获取当月的周列表
export const getWeeksInMonth = (year: string, month: string) => {
  const firstDay = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
  const lastDay = new Date(Number.parseInt(year), Number.parseInt(month), 0);
  const weeks = [];

  // Get the Monday of the week containing the first day of the month
  let currentDate = new Date(firstDay);
  let dayOfWeek = currentDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ensure we start from Monday
  currentDate.setDate(currentDate.getDate() + diff);

  // Create weeks array
  while (currentDate <= lastDay) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Format the dates
    const startYear = weekStart.getFullYear();
    const startMonth = weekStart.getMonth() + 1;
    const startDay = weekStart.getDate();

    const endYear = weekEnd.getFullYear();
    const endMonth = weekEnd.getMonth() + 1;
    const endDay = weekEnd.getDate();

    // Build display string with proper formatting for different scenarios
    let display = '';

    if (startYear !== endYear) {
      // Cross-year scenario
      display = `${startYear}年${startMonth}月${startDay}日—${endYear}年${endMonth}月${endDay}日`;
    } else if (startMonth !== endMonth) {
      // Cross-month scenario
      display = `${startMonth}月${startDay}日—${endMonth}月${endDay}日`;
    } else {
      // Same month scenario
      display = `${startMonth}月${startDay}日—${endDay}日`;
    }

    weeks.push({
      startDate: weekStart,
      endDate: weekEnd,
      start: startDay.toString().padStart(2, '0'),
      end: endDay.toString().padStart(2, '0'),
      display,
      startMonth,
      endMonth,
      startYear,
      endYear
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }
  return weeks;
}

/**
 * 获取当前日期属于一年之中的第几周
 * @param date 
 * @returns 
 */
export const getDayofWeekInYear = (date: Date) => {
  // 创建日期副本以避免修改原始日期
  const targetDate = new Date(date)

  // 获取目标日期所在年份的1月1日
  const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1)

  // 获取1月1日是星期几（0-6，0表示周日）
  const firstDayOfWeekday = firstDayOfYear.getDay()

  // 将1月1日调整到所在周的周一
  const diff = firstDayOfWeekday === 0 ? -6 : 1 - firstDayOfWeekday
  firstDayOfYear.setDate(firstDayOfYear.getDate() + diff)

  // 计算目标日期与第一周周一的天数差
  const daysDiff = Math.floor((targetDate.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000))

  // 计算周数（向上取整，因为即使只过了一天也算作新的一周）
  return Math.ceil((daysDiff + 1) / 7)
}