import { Metadata } from "next"

export const metadata: Metadata = {
  title: "验证邮箱订阅 - MCP",
  description: "验证您的邮箱订阅以接收我们的更新通知。",
}

export default function VerifySubscriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}