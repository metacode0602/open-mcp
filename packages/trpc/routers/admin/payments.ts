import { paymentsDataAccess } from "@repo/db/database/admin";
import {
  zCreatePaymentSchema,
  zSearchPaymentsSchema,
  zUpdatePaymentSchema,
  zPaymentStatusEnum,
} from "@repo/db/types";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { adminProcedure, router } from "../../trpc";

export const paymentsRouter = router({
  create: adminProcedure.input(zCreatePaymentSchema).mutation(async ({ input }) => {
    return paymentsDataAccess.create(input);
  }),

  update: adminProcedure.input(zUpdatePaymentSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;
    // @ts-expect-error
    return paymentsDataAccess.update(id, data);
  }),

  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return paymentsDataAccess.getById(input.id);
  }),

  search: adminProcedure.input(zSearchPaymentsSchema).query(async ({ input }) => {
    return paymentsDataAccess.search(input);
  }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return paymentsDataAccess.delete(input.id);
  }),

  updateStatus: adminProcedure.input(z.object({ id: z.string(), status: zPaymentStatusEnum })).mutation(async ({ input }) => {
    try {
      return await paymentsDataAccess.updateStatus(input.id, input.status);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "更新支付状态失败",
        cause: error,
      });
    }
  }),
  getListByUserId: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return paymentsDataAccess.getPaymentsByUserId(input.userId);
    }),
}); 