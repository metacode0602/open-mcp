import { tagsDataAccess } from "@repo/db/database/admin";
import { zSearchTagsSchema } from "@repo/db/types";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";


export const mcpTagsRouter = router({

  // 获取标签
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return tagsDataAccess.getById(input.id);
  }),

  list: publicProcedure.input(zSearchTagsSchema).query(async ({ input }) => {
    return tagsDataAccess.list(input);
  }),
}); 