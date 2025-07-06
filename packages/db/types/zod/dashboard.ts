import { z } from "zod";

export const zDashboardStatsSchema = z.object({
  users: z.object({
    total: z.number(),
    change: z.number(),
    increasing: z.boolean(),
  }),
  apps: z.object({
    total: z.number(),
    change: z.number(),
    increasing: z.boolean(),
  }),
  ads: z.object({
    total: z.number(),
    change: z.number(),
    increasing: z.boolean(),
  }),
  revenue: z.object({
    total: z.number(),
    change: z.number(),
    increasing: z.boolean(),
  }),
});

export const zPendingItemsSchema = z.object({
  apps: z.number(),
  claims: z.number(),
  suggestions: z.number(),
  ads: z.number(),
  payments: z.number(),
});

export const zActivityTypeSchema = z.enum([
  "app_submission",
  "claim",
  "suggestion",
  "ad_purchase",
  "payment",
]);

export const zActivityStatusSchema = z.enum([
  "completed",
  "pending",
  "rejected",
]);

export const zRecentActivitySchema = z.object({
  id: z.string(),
  type: zActivityTypeSchema,
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  status: zActivityStatusSchema,
  user: z.string(),
  link: z.string(),
});

export const zDashboardDataSchema = z.object({
  stats: zDashboardStatsSchema,
  pendingItems: zPendingItemsSchema,
  recentActivities: z.array(zRecentActivitySchema),
});

export type DashboardStats = z.infer<typeof zDashboardStatsSchema>;
export type PendingItems = z.infer<typeof zPendingItemsSchema>;
export type RecentActivity = z.infer<typeof zRecentActivitySchema>;
export type DashboardData = z.infer<typeof zDashboardDataSchema>; 