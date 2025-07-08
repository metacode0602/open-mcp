"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { LoginForm } from "@/components/auth/signin-form"

export function AuthView({ pathname }: { pathname: string }) {
  // Just an example, SettingsCards already includes this
  // useAuthenticate({ enabled: pathname === "settings" })
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo")

  useEffect(() => {
    router.refresh()
  }, [router])

  // 如果有重定向参数，使用自定义登录表单
  if (redirectTo) {
    return (
      <main className="flex grow flex-col items-center justify-center gap-4 p-4">
        <LoginForm />
      </main>
    )
  }

  // 否则使用默认的AuthCard
  return (
    <main className="flex grow flex-col items-center justify-center gap-4 p-4">
      <AuthCard pathname={pathname} />
      {/* <PhoneLogin /> */}
    </main>
  )
}
