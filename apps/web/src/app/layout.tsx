import type { Metadata, Viewport } from "next"
import { geistMono, geistSans } from "./fonts";
import { UmamiProvider } from "@repo/track";
import "@repo/ui/globals.css"
import "@/styles/custom.css"

import type { ReactNode } from "react"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "OpenMCP",
  description: "探索 MCP 客户端、服务器和开源应用的综合导航平台"
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: "cover",
  width: "device-width",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" }
  ]
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name='apple-mobile-web-app-title' content='共绩算力' />
        <UmamiProvider />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex min-h-svh flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
