import { rankingRecordsDataAccess, rankingsDataAccess } from "@repo/db/database/admin";
import {
  zCreateRankingSchema,
  zSearchRankingsSchema,
  zUpdateRankingSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const rankingsRouter = router({
  // 创建标签
  create: adminProcedure.input(zCreateRankingSchema).mutation(async ({ ctx, input }) => {
    const { createdBy, ...data } = input;
    return rankingsDataAccess.create({ ...data, createdBy: ctx.user.id });
  }),

  // 更新标签
  update: adminProcedure.input(zUpdateRankingSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;
    // @ts-expect-error
    return rankingsDataAccess.update(id, data);
  }),
  // 获取标签
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return rankingsDataAccess.getById(input.id);
  }),

  // 搜索标签
  search: adminProcedure.input(zSearchRankingsSchema).query(async ({ input }) => {
    return rankingsDataAccess.search(input);
  }),

  list: adminProcedure.input(zSearchRankingsSchema).query(async ({ input }) => {
    return rankingsDataAccess.list(input);
  }),
  // 删除标签
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return rankingRecordsDataAccess.delete(input.id);
  }),
}); 