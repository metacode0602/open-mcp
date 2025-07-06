import { z } from "zod";

export const dashboardStatsSchema = z.object({
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

export const pendingItemsSchema = z.object({
  apps: z.number(),
  claims: z.number(),
  suggestions: z.number(),
  ads: z.number(),
  payments: z.number(),
});

export const activityTypeSchema = z.enum([
  "app_submission",
  "claim",
  "suggestion",
  "ad_purchase",
  "payment",
]);

export const activityStatusSchema = z.enum([
  "completed",
  "pending",
  "rejected",
]);

export const recentActivitySchema = z.object({
  id: z.string(),
  type: activityTypeSchema,
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  status: activityStatusSchema,
  user: z.string(),
  link: z.string(),
});

export const dashboardDataSchema = z.object({
  stats: dashboardStatsSchema,
  pendingItems: pendingItemsSchema,
  recentActivities: z.array(recentActivitySchema),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type PendingItems = z.infer<typeof pendingItemsSchema>;
export type RecentActivity = z.infer<typeof recentActivitySchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>; 