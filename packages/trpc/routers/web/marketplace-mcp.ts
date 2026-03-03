import { marketplaceDataAccess } from "@repo/db/database/web";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

const listInput = z.object({
  type: z.enum(["client", "server"]),
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const marketplaceMcpRouter = router({
  list: publicProcedure.input(listInput).query(async ({ input }) => {
    return marketplaceDataAccess.listMcpForMarket({
      type: input.type,
      categorySlug: input.categorySlug,
      tagSlug: input.tagSlug,
      query: input.query,
      limit: input.limit,
      offset: input.offset,
    });
  }),
});
