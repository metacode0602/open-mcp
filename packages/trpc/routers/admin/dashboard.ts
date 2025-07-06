import { dashboardDataAccess } from "@repo/db/database/admin";
import { adminProcedure, createTRPCRouter } from "@repo/trpc";


export const dashboardRouter = createTRPCRouter({
  getStats: adminProcedure
    .query(async () => {
      return dashboardDataAccess.getDashboardStats();
    }),

  getPendingItems: adminProcedure
    .query(async () => {
      return dashboardDataAccess.getPendingItems();
    }),

  getRecentActivities: adminProcedure
    .query(async () => {
      return dashboardDataAccess.getRecentActivities();
    })
}); 