import { claimsDataAccess } from "@repo/db/database/admin";
import {
  zCreateClaimSchema,
  zSearchClaimsSchema,
  zUpdateClaimSchema,
} from "@repo/db/types";
import { adminProcedure, router } from "../../trpc";
import { z } from "zod";

export const claimsRouter = router({
  // 创建声明
  create: adminProcedure
    .input(zCreateClaimSchema)
    .mutation(async ({ input }) => {
      return claimsDataAccess.create(input);
    }),

  // 更新声明
  update: adminProcedure
    .input(zUpdateClaimSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return claimsDataAccess.update(id, data);
    }),

  // 获取声明
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return claimsDataAccess.getById(input.id);
    }),

  // 搜索声明
  search: adminProcedure
    .input(zSearchClaimsSchema)
    .query(async ({ input }) => {
      return claimsDataAccess.search({ ...input, pageSize: input.limit });
    }),

  // 删除声明
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return claimsDataAccess.delete(input.id);
    }),

  getListByUserId: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return claimsDataAccess.getClaimsByUserId(input.userId);
    }),
  updateStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.enum(["pending", "approved", "rejected"]) }))
    .mutation(async ({ ctx, input }) => {
      const { id, status } = input;
      return claimsDataAccess.updateStatus(id, status, ctx.user.id);
    }),
});