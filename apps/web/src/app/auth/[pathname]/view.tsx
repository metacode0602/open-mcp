"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { AuthCard } from "@daveyplate/better-auth-ui"
export function AuthView({ pathname }: { pathname: string }) {
  // Just an example, SettingsCards already includes this
  // useAuthenticate({ enabled: pathname === "settings" })
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, [router])

  return (
    <main className="flex grow flex-col items-center justify-center gap-4 p-4">
      <AuthCard pathname={pathname} />
      {/* <PhoneLogin />
      <LoginForm /> */}
    </main>
  )
}
