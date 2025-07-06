import { Metadata } from "next"

export const metadata: Metadata = {
  title: "取消邮箱订阅 - MCP",
  description: "取消接收我们的邮件更新通知。",
}

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}