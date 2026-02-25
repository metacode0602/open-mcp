"use client"

import { Button } from "@repo/ui/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@repo/ui/components/ui/sheet"
import { Menu, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { useSession } from "@/hooks/auth-hooks"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        <div className="flex h-14 sm:h-16 items-center gap-2 justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-initial md:mr-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label="打开菜单">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 sm:w-[300px]">
                <SheetHeader className="border-b p-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <LogoIcon type="openmcp" />
                    <span className="font-bold">OpenMCP</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-0 p-2">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-muted ${route.active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                    >
                      {route.label}
                    </Link>
                  ))}
                  <div className="my-2 border-t pt-2">
                    {session ? (
                      <Link
                        href="/web/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        控制台
                      </Link>
                    ) : (
                      <Link
                        href="/auth/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <User className="h-4 w-4" />
                        登录
                      </Link>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 truncate">
              <LogoIcon type="openmcp" className="shrink-0" />
              <span className="font-bold hidden sm:inline-block truncate">OpenMCP</span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-2">
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${route.active ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
            <Button variant="outline" size="sm" className="rounded-full shrink-0 text-xs sm:text-sm min-h-9" asChild>
              {session ? (
                <Link href="/web/dashboard" className="inline-flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 shrink-0 sm:mr-2" />
                  <span className="hidden sm:inline">控制台</span>
                </Link>
              ) : (
                <Link href="/auth/sign-in" className="inline-flex items-center">
                  <User className="h-4 w-4 mr-1 shrink-0 sm:mr-2" />
                  <span className="hidden sm:inline">登录</span>
                </Link>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  )
}

