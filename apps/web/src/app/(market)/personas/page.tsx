import type { Metadata } from "next"
import { PersonasGrid } from "./components/personas-grid"

export const metadata: Metadata = {
  title: "AI 员工配置包 - OpenMCP",
  description: "浏览经过验证的 AI 员工配置包，涵盖领导力、工程、营销、支持、运营及社交、创意、效率、知识等分类。",
}

export default function PersonasPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-border px-6 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-glow),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-glow-dark),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              18 个 AI 员工配置包
            </span>
          </div>
          <h1 className="mb-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            AI 员工配置包
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            完整的 AI 员工配置包，包含个性、记忆系统、决策框架和工具设置。购买后几分钟内完成安装。
          </p>
        </div>
      </section>
      <PersonasGrid />
    </main>
  )
}
