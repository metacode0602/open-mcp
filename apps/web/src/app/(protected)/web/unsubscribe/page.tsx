"use client"

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useEffect, useState } from "react"

import { trpc } from "@/lib/trpc/client"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") as string
  const token = searchParams.get("token") as string
  const [unsubscribed, setUnsubscribed] = useState(false)
  const [error, setError] = useState("")

  const unsubscribeMutation = trpc.mcpSubscriptions.unsubscribe.useMutation({
    onSuccess: () => {
      setUnsubscribed(true)
      setError("")
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  useEffect(() => {
    if (email) {
      unsubscribeMutation.mutate({ email, token })
    } else {
      setError("无效的退订链接")
    }
  }, [email])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>取消邮箱订阅</CardTitle>
          <CardDescription>取消接收我们的邮件更新</CardDescription>
        </CardHeader>
        <CardContent>
          {unsubscribeMutation.isPending && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="flex flex-row gap-2 itesm-center">正在验证中 <Loader2 className="h-4 w-4 animate-spin" /></AlertTitle>
              <AlertDescription>
                请稍候，正在处理您的退订请求...
              </AlertDescription>
            </Alert>
          )}

          {unsubscribed && (
            <Alert className="bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">退订成功</AlertTitle>
              <AlertDescription className="text-green-600">
                您已成功取消邮件订阅。如果您改变主意，随时可以重新订阅。
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>退订失败</AlertTitle>
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

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeContent />
    </Suspense>
  )
}