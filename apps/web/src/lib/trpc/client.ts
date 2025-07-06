import { type AppRouter } from "@repo/trpc";
import { createTRPCClient } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { trpcLinks } from "./links";

// TRPC Client Api for Client Components with "use client"
import type { TRPCClient } from "@trpc/client";

export const clientApi: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: trpcLinks,
});

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();