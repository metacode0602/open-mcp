import { marketplaceDataAccess } from "@repo/db/database/web";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

const listInput = z.object({
  categorySlug: z.string().optional(),
  tagSlug: z.string().optional(),
  query: z.string().optional(),
  limit: z.coerce.number().optional(),
  offset: z.coerce.number().optional(),
});

export const marketplacePersonasRouter = router({
  list: publicProcedure.input(listInput).query(async ({ input }) => {
    return marketplaceDataAccess.listPersonasForMarket({
      categorySlug: input.categorySlug,
      tagSlug: input.tagSlug,
      query: input.query,
      limit: input.limit,
      offset: input.offset,
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return marketplaceDataAccess.getPersonaById(input.id);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return marketplaceDataAccess.getPersonaBySlug(input.slug);
    }),
});
