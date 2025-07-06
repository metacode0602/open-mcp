"use client"

import { ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@repo/ui/components/ui/button"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { useSession } from "@/hooks/auth-hooks"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const routes = [
    {
      href: "/",
      label: "首页",
      active: pathname === "/",
    },
    {
      href: "/ranking",
      label: "排行",
      active: pathname === "/ranking",
    },
    {
      href: "/category/client",
      label: "客户端",
      active: pathname === "/category/client",
    },
    {
      href: "/category/server",
      label: "服务器",
      active: pathname === "/category/server",
    },
    {
      href: "/category/application",
      label: "应用",
      active: pathname === "/category/application",
    },
    {
      href: "/advertise",
      label: "推广",
      active: pathname === "/advertise",
    },
    {
      href: "/submit",
      label: "提交应用",
      active: pathname === "/submit",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <LogoIcon type="openmcp" />
              <span className="font-bold hidden sm:inline-block">OpenMCP</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="hidden md:flex items-center gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${route.active ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                {session ? (
                  <Link href="/web/dashboard">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    控制台
                  </Link>
                ) : (
                  <Link href="/auth/sign-in">
                    <User className="h-4 w-4 mr-2" />
                    登录
                  </Link>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
}

