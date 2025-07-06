import { categoriesDataAccess } from "@repo/db/database/admin";
import {
  zCreateCategorySchema,
  zSearchCategoriesSchema,
  zUpdateCategorySchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const categoriesRouter = router({
  // 创建分类
  create: adminProcedure
    .input(zCreateCategorySchema)
    .mutation(async ({ input }) => {
      return categoriesDataAccess.create(input);
    }),

  // 更新分类
  update: adminProcedure
    .input(zUpdateCategorySchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return categoriesDataAccess.update(id, { id, ...data });
    }),
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["offline", "online"]),
    }))
    .mutation(async ({ input }) => {
      return categoriesDataAccess.updateStatus(input.id, input.status);
    }),
  // 获取分类
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return categoriesDataAccess.getById(input.id);
    }),

  // 搜索分类
  search: adminProcedure
    .input(zSearchCategoriesSchema)
    .query(async ({ input }) => {
      return categoriesDataAccess.search(input);
    }),

  // 删除分类
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return categoriesDataAccess.delete(input.id);
    }),
});