import { categoriesDataAccess } from "@repo/db/database/admin";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const mcpCategoriesRouter = router({
  // 获取分类
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return categoriesDataAccess.getById(input.id);
    }),

  // 获取分类
  getCategories: publicProcedure
    .input(z.object({
      type: z.enum(["client", "server", "application"]),
    }))
    .query(async ({ input }) => {
      return categoriesDataAccess.getCategoriesByType(input.type);
    }),
}); 