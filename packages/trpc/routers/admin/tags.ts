import { tagsDataAccess } from "@repo/db/database/admin";
import {
  zCreateTagSchema,
  zSearchTagsSchema,
  zUpdateTagSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";
export const tagsRouter = router({
  // 创建标签
  create: adminProcedure.input(zCreateTagSchema).mutation(async ({ ctx, input }) => {
    const { createdBy, ...data } = input;
    return tagsDataAccess.create({ ...data, createdBy: ctx.user.id });
  }),

  // 更新标签
  update: adminProcedure.input(zUpdateTagSchema).mutation(async ({ input }) => {
    const { id, ...data } = input;
    // @ts-expect-error
    return tagsDataAccess.update(id, data);
  }),

  updateDeleted: adminProcedure
    .input(
      z.object({
        id: z.string(),
        deleted: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, deleted } = input;
      return tagsDataAccess.updateDeleted(id, deleted);
    }),
  // 获取标签
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return tagsDataAccess.getById(input.id);
  }),

  // 搜索标签
  search: adminProcedure.input(zSearchTagsSchema).query(async ({ input }) => {
    return tagsDataAccess.search(input);
  }),

  list: adminProcedure.input(zSearchTagsSchema).query(async ({ input }) => {
    return tagsDataAccess.list(input);
  }),
  // 删除标签
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return tagsDataAccess.delete(input.id, ctx.user.id);
  }),
}); 