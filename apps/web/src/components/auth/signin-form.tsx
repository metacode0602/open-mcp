"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { PhoneSignin } from "@/components/auth/phone-signin"
import { EmailLogin } from "@/components/auth/email-signin"
import { Button } from "@repo/ui/components/ui/button"
import { Switch } from "@repo/ui/components/ui/switch"
import { Label } from "@repo/ui/components/ui/label"

export type AuthMode = "phone" | "email"

interface LoginFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  isModal?: boolean
}

export function LoginForm({ onSuccess, onCancel, isModal = false }: LoginFormProps) {
  const [authMode, setAuthMode] = useState<AuthMode>("phone")
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectTo)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-lg">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
        <CardDescription className="text-center">登录您的账户继续访问</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-2 mb-6 bg-muted/50 p-2 rounded-lg">
          <Label
            htmlFor="auth-mode"
            className={`text-sm ${authMode === "phone" ? "font-medium" : "text-muted-foreground"}`}
          >
            手机号登录
          </Label>
          <Switch
            id="auth-mode"
            checked={authMode === "email"}
            onCheckedChange={(checked) => setAuthMode(checked ? "email" : "phone")}
          />
          <Label
            htmlFor="auth-mode"
            className={`text-sm ${authMode === "email" ? "font-medium" : "text-muted-foreground"}`}
          >
            邮箱登录
          </Label>
        </div>

        {authMode === "phone" ? (
          <PhoneSignin onSuccess={handleSuccess} />
        ) : (
          <EmailLogin onSuccess={handleSuccess} />
        )}
      </CardContent>
      {isModal && (
        <CardFooter>
          <Button variant="ghost" onClick={onCancel} className="w-full">
            取消
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
