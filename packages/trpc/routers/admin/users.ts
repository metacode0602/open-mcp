import { adsDataAccess, appsDataAccess, usersDataAccess, claimsDataAccess, paymentsDataAccess } from "@repo/db/database/admin";
import {
  zCreateUserSchema,
  zSearchUsersSchema,
  zUpdateUserSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const usersRouter = router({
  // 创建用户
  create: adminProcedure
    .input(zCreateUserSchema)
    .mutation(async ({ input }) => {
      return usersDataAccess.create(input);
    }),

  // 更新用户
  update: adminProcedure
    .input(zUpdateUserSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      // @ts-expect-error
      return usersDataAccess.update(id, data);
    }),

  // 获取用户
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return usersDataAccess.getById(input.id);
    }),

  getByIdWithData: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await usersDataAccess.getById(input.id);
      if (!user) {
        throw new Error("User not found");
      }
      const appCount = await appsDataAccess.getAppCountByUserId(user.id);
      const adsCount = await adsDataAccess.getAdsCountByUserId(user.id);
      const claimCount = await claimsDataAccess.getClaimsCountByUserId(user.id);
      const paymentCount = await paymentsDataAccess.getPaymentsCountByUserId(user.id);
      return { ...user, appCount: appCount, adsCount: adsCount, claimCount: claimCount, paymentCount: paymentCount }; // TODO: 统计数据
    }),

  // 搜索用户
  search: adminProcedure
    .input(zSearchUsersSchema)
    .query(async ({ input }) => {
      return usersDataAccess.search(input);
    }),

  // 删除用户
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return usersDataAccess.delete(input.id);
    }),
}); 