import { invoiceData } from "@repo/db/database/admin";
import {
  zCreateInvoiceSchema,
  zSearchInvoicesSchema,
  zUpdateInvoiceSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const invoicesRouter = router({
  // 创建发票
  create: adminProcedure
    .input(zCreateInvoiceSchema)
    .mutation(async ({ input }) => {
      return await invoiceData.create(input);
    }),

  // 更新发票
  update: adminProcedure
    .input(zUpdateInvoiceSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await invoiceData.update(id, { id, ...data });
    }),

  // 获取发票
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await invoiceData.getById(input.id);
    }),

  // 搜索发票
  search: adminProcedure
    .input(zSearchInvoicesSchema)
    .query(async ({ input }) => {
      return await invoiceData.search(input);
    }),

  // 删除发票
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await invoiceData.delete(input.id);
    }),
});