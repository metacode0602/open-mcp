import { suggestionsDataAccess } from "@repo/db/database/admin";
import {
  zCreateSuggestionSchema,
  zSearchSuggestionsSchema,
  zUpdateSuggestionSchema,
} from "@repo/db/types";
import { adminProcedure, router } from "../../trpc";
import { z } from "zod";

export const suggestionsRouter = router({
  // 创建建议
  create: adminProcedure
    .input(zCreateSuggestionSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("[suggestion] [create] input", input);
      return suggestionsDataAccess.create({
        ...input,
        userId: ctx.user.id,
      });
    }),

  // 更新建议
  update: adminProcedure
    .input(zUpdateSuggestionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return suggestionsDataAccess.update(id, {
        ...data,
        id,
        userId: ctx.user.id,
      });
    }),

  // 获取建议
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return suggestionsDataAccess.getById(input.id);
    }),

  // 搜索建议
  search: adminProcedure
    .input(zSearchSuggestionsSchema)
    .query(async ({ input }) => {
      return suggestionsDataAccess.search(input);
    }),

  // 删除建议
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return suggestionsDataAccess.delete(input.id);
    }),

  getListByUserId: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return suggestionsDataAccess.getSuggestionsByUserId(input.userId);
    }),
}); 