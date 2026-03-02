import Link from "next/link"
import { Terminal } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Terminal className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            OpenMCP
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Marketplace
          </Link>
          <Link
            href="/skills"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Skills
          </Link>
          <Link
            href="/clawsourcing"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Clawsourcing
          </Link>
          <Link
            href="/contribute"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            贡献指南
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          The Masinov Company. Bridging AI capability and real-world application.
        </p>
      </div>
    </footer>
  )
}
