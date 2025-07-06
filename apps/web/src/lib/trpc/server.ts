import { createTRPCContext, UserWithRole, type AppRouter } from "@repo/trpc";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";
import { authClient } from "../auth-client";
import { auth } from "../auth";

// TRPC Server Api
export const serverApi: ReturnType<typeof createTRPCClient<AppRouter>> = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      // TODO: Change this to be a full URL exposed as a client side setting
      url: `${process.env.NEXT_INTERNAL_API_URL}/api/trpc`,
      maxURLLength: 14000,
      transformer: superjson,
      headers: async () => {
        const session = await authClient.getSession();
        console.info("[lib/trpc/server] [headers] 1 ", session)
        if (session instanceof Error || !session) {
          return {};
        }
        return {
          Authorization: `Bearer ${session.data?.session.token}`,
          "x-trpc-source": "server",
        };
      },
    }),
  ],
});



/**
 * 从请求中创建tRPC上下文
 * @param req 
 * @returns 
 */
export const createContextFromRequest = async (req: Request) => {
  const headers = new Headers(req.headers);
  const authSession = await getUserFromRequest(req);
  // console.log("[route.ts] [createContextFromRequest] user", authSession);
  return createTRPCContext({ headers, req, user: authSession?.user as UserWithRole, session: authSession?.session });
};

/**
 * 从请求中获取用户
 * @param req 
 * @returns 
 */
const getUserFromRequest = async (req: Request) => {

  const authSession = await auth.api.getSession({
    headers: req.headers
  })

  const source = req.headers.get('x-trpc-source') ?? 'unknown'
  console.log('>>> tRPC Request from', source, 'by', authSession?.user, "session:", authSession?.session)
  return authSession
};