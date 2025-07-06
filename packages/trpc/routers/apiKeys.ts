import { protectedProcedure, publicProcedure, router } from "../trpc";

export const apiKeysAppRouter = router({
  createApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx;
    console.log("createApiKey", user);
    return user;
  }),

  getApiKeys: publicProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    console.log("getApiKeys", user);
    return user;
  }),
});

export type ApiKeysAppRouter = typeof apiKeysAppRouter;