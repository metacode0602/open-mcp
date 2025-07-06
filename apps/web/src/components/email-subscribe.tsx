"use client"

import type React from "react"
import { Send } from "lucide-react"
import { useState } from "react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc/client"

interface EmailSubscribeProps {
  className?: string
}

export function EmailSubscribe({ className }: EmailSubscribeProps) {
  const [email, setEmail] = useState("")

  const subscribe = trpc.mcpSubscriptions.subscribe.useMutation({
    onSuccess: () => {
      toast.success("订阅成功", {
        description: "我们已向您的邮箱发送了一封验证邮件，请查收并点击验证链接",
      })
      setEmail("")
    },
    onError: (error) => {
      toast.error("订阅失败", {
        description: error.message,
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("无效的邮箱地址", {
        description: "请输入有效的邮箱地址",
      })
      return
    }

    subscribe.mutate({
      email,
      referringSite: window.location.hostname,
    })
  }

  return (
    <form onSubmit={handleSubmit} className={`flex w-full max-w-sm items-center space-x-2 ${className}`}>
      <Input
        type="email"
        placeholder="输入您的邮箱..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={subscribe.isPending}
        required
      />
      <Button type="submit" disabled={subscribe.isPending}>
        {subscribe.isPending ? (
          "订阅中..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" /> 订阅
          </>
        )}
      </Button>
    </form>
  )
}

