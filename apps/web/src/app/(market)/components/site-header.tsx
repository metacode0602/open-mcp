"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Terminal, Menu, X, User, ShieldCheck } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@repo/ui/components/ui/button"
import { useSession } from "@/hooks/auth-hooks"

const navItems = [
  { label: "首页", href: "/" },
  { label: "AI 员工", href: "/personas" },
  { label: "Skills", href: "/skills" },
  { label: "MCP", href: "/mcp" },
  { label: "定制服务", href: "/clawsourcing" },
  { label: "关于我们", href: "/aboutus" },
  { label: "博客", href: "/blog" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight text-foreground">
              OpenMCP
            </span>
            <span className="text-xs leading-tight text-muted-foreground">
              AI Assistant Store
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
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
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            GitHub
          </Link>
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              GitHub
            </Link>
            <div className="flex items-center justify-between rounded-lg px-4 py-2.5">
              <span className="text-sm text-muted-foreground">主题模式</span>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
