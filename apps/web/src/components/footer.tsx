"use client"

import Link from "next/link"
import { useState } from "react"

import { EmailSubscribe } from "@/components/email-subscribe"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { WechatQRCodeDialog } from "@/components/wechat-qrcode-dialog"

export function Footer() {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  return (
    <footer className="w-full border-t py-10 bg-muted/20">
      <Container>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LogoIcon type="openmcp" />
              <span className="font-bold">OpenMCP</span>
            </div>
            <p className="text-sm text-muted-foreground">
              OpenMCP 是一个一站式 AI 全聚合平台，专注于 MCP 生态的构建和发展，推动AI技术创新和应用落地。
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/client" className="text-muted-foreground hover:text-foreground transition-colors">
                  MCP 客户端
                </Link>
              </li>
              <li>
                <Link href="/category/server" className="text-muted-foreground hover:text-foreground transition-colors">
                  MCP 服务器
                </Link>
              </li>
              <li>
                <Link
                  href="/category/application"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  MCP 应用
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-muted-foreground hover:text-foreground transition-colors">
                  提交应用
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">关于我们</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  关于 OpenMCP
                </Link>
              </li>
              <li>
                <Link href="/about/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/about/service" className="text-muted-foreground hover:text-foreground transition-colors">
                  服务条款
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setIsContactDialogOpen(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                >
                  联系我们
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">订阅更新</h3>
            <p className="text-sm text-muted-foreground">订阅我们的邮件列表，获取 MCP 生态系统的最新动态和更新。</p>
            <EmailSubscribe />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Copyright ©2025-2027 天津聚链科技有限公司版权所有</p>
            <p className="text-xs text-muted-foreground">
              <Link href="https://beian.miit.gov.cn/" target="_blank" className="hover:underline">
                津ICP备2023007973号-1
              </Link>{" "}
              |{" "}
              <Link href="http://www.beian.gov.cn/portal/registerSystemInfo" target="_blank" className="hover:underline">
                津公网安备12011402001495号
              </Link>
            </p>
          </div>
        </div>
      </Container>

      <WechatQRCodeDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />
    </footer>
  )
}