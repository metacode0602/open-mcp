"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { trpc } from "@/lib/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"
import { Suspense } from "react"

function VerifySubscriptionContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  const verifyMutation = trpc.mcpSubscriptions.verify.useMutation({
    onSuccess: () => {
      setVerified(true)
      setError("")
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token })
    } else {
      setError("验证链接无效")
    }
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>邮箱订阅验证</CardTitle>
          <CardDescription>验证您的邮箱订阅以接收更新</CardDescription>
        </CardHeader>
        <CardContent>
          {verifyMutation.isPending && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex flex-row gap-2 itesm-center">正在验证中 <Loader2 className="h-4 w-4 animate-spin" /></AlertTitle>
              <AlertDescription>
                请稍候，正在验证您的邮箱...
              </AlertDescription>
            </Alert>
          )}

          {verified && (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">验证成功</AlertTitle>
              <AlertDescription className="text-green-600">
                您的邮箱已成功验证。您将开始收到我们的更新通知。
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>验证失败</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifySubscriptionPage() {
  return (
    <Suspense>
      <VerifySubscriptionContent />
    </Suspense>
  )
}