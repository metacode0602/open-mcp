import { appRouter } from "@repo/trpc"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { createContextFromRequest } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

/**
 * 处理tRPC请求
 * @param req 
 * @returns 
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async (opts) => {
      return await createContextFromRequest(opts.req);
    },
  })

export { handler as GET, handler as POST }



