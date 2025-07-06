import { emailSubscriptionData } from "@repo/db/database/admin";
import {
  zCreateEmailSubscriptionSchema,
  zSearchEmailSubscriptionsSchema,
  zUpdateEmailSubscriptionSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const emailSubscriptionsRouter = router({
  // 创建邮件订阅
  create: adminProcedure
    .input(zCreateEmailSubscriptionSchema)
    .mutation(async ({ input }) => {
      return await emailSubscriptionData.create(input);
    }),

  // 更新邮件订阅
  update: adminProcedure
    .input(zUpdateEmailSubscriptionSchema)
    .mutation(async ({ input }) => {
      // @ts-expect-error
      return await emailSubscriptionData.update(input);
    }),

  // 获取邮件订阅
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await emailSubscriptionData.getById(input.id);
    }),

  // 搜索邮件订阅
  search: adminProcedure
    .input(zSearchEmailSubscriptionsSchema)
    .query(async ({ input }) => {
      return await emailSubscriptionData.search(input);
    }),

  // 删除邮件订阅
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await emailSubscriptionData.delete(input.id);
    }),
}); 