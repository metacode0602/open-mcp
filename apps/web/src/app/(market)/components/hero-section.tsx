import Link from "next/link"
import { ArrowDown, ArrowRight, Store, Cpu } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border px-6 py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-glow),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-glow-dark),transparent_70%)]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            The App Store for AI Assistants
          </span>
        </div>

        <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
          AI 助手的
          <span className="text-primary">应用商店</span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Personas 角色配置包 + Skills 技能组件，弥合 AI 能力与实际应用之间的差距。由实际运营 AI 助手的操作员创建，购买后几分钟内完成安装。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#marketplace"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Store className="h-4 w-4" />
            浏览 Marketplace
            <ArrowDown className="h-4 w-4" />
          </a>
          <Link
            href="/skills"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
          >
            <Cpu className="h-4 w-4" />
            Skills 技能仓库
          </Link>
          <Link
            href="/clawsourcing"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
          >
            Clawsourcing 定制服务
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
