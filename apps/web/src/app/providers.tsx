"use client"

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"
import { AuthUIProviderTanstack } from "@daveyplate/better-auth-ui/tanstack"
import { AppRouter } from "@repo/trpc"
import { isServer,QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCClient } from "@trpc/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeProvider } from "next-themes"
import { type ReactNode,useState } from "react"
import { toast,Toaster } from "sonner"

import { authClient } from "@/lib/auth-client"
import { trpc } from "@/lib/trpc/client"
import { trpcLinks } from "@/lib/trpc/links"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000
      }
    }
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }

  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()
  queryClient.getQueryCache().config.onError = (error, query) => {
    console.error(error, query)

    if (error.message) toast.error(error.message)
  }

  const [trpcClient] = useState(() => {
    return createTRPCClient<AppRouter>({
      links: trpcLinks,
    });
  });

  const router = useRouter()

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthUIProviderTanstack
              authClient={authClient}
              navigate={router.push}
              replace={router.replace}
              onSessionChange={() => {
                router.refresh()
              }}
              Link={Link}
              localization={{
                signIn: "登录",
                signUp: "注册",
                signOut: "退出登录",
                settings: "账号设置",
                account: "账号",
                email: "邮箱",
                password: "密码",
                confirmPassword: "确认密码",
                newPassword: "新密码",
                forgotPassword: "忘记密码?",
                resetPassword: "重置密码",
                continue: "继续",
                cancel: "取消",
                delete: "删除",
                name: "名称",
                username: "用户名",
                currentPassword: "当前密码",
                avatar: "头像",
                save: "保存"
              }}
            >
              {children}

              <Toaster />
            </AuthUIProviderTanstack>
          </ThemeProvider>
        </AuthQueryProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
