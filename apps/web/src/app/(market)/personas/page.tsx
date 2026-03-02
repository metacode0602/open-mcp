import type { Metadata } from "next"
import { PersonasGrid } from "./components/personas-grid"

export const metadata: Metadata = {
  title: "Skills 仓库 - OpenClaw Usecases",
  description: "浏览可复用的自动化技能组件，涵盖数据采集、AI 处理、平台集成、内容输出等五大分类。",
}

export default function PersonasPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-border px-6 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-glow),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,var(--color-glow-dark),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              10 个可复用 Skills
            </span>
          </div>
          <h1 className="mb-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Skills 仓库
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            可复用的自动化技能组件，像搭积木一样组合使用，快速构建你的 AI 工作流。
          </p>
        </div>
      </section>
      <PersonasGrid />
    </main>
  )
}
