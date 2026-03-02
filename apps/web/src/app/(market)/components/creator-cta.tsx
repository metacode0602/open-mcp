import Link from "next/link"
import { Code, ArrowRight, BadgeCheck, DollarSign } from "lucide-react"

export function CreatorCta() {
  return (
    <section className="border-b border-border bg-card px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
          <Code className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            For Creators
          </span>
        </div>

        <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
          {'成为 OpenMCP 创作者'}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
          {'将你的 AI 配置经验转化为收入。发布 Persona 或 Skill，获得 90% 收入分成。支持 API 发布，无需审核队列。'}
        </p>

        <div className="mx-auto mb-10 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">90%</p>
              <p className="text-xs text-muted-foreground">{'收入分成'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">{'即时发布'}</p>
              <p className="text-xs text-muted-foreground">{'无审核队列'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="text-lg font-bold text-foreground">API</p>
              <p className="text-xs text-muted-foreground">{'程序化发布'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/skills/submit"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {'提交你的 Skill'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
          >
            {'查看贡献指南'}
          </Link>
        </div>
      </div>
    </section>
  )
}
