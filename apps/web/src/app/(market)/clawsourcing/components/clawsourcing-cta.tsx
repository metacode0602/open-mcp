import { Send, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ClawsourcingCta() {
  return (
    <section id="cta" className="px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-8 py-16 text-center">
          <Send className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground md:text-4xl">
            {'准备好拥有你的 AI 员工了吗？'}
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-pretty text-lg text-muted-foreground">
            {'预约 30 分钟免费咨询，我们将深入了解你的需求并提供定制方案建议。'}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:hello@masinov.com"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {'预约免费咨询'}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-8 py-3.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
            >
              {'浏览 Marketplace'}
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {'The Masinov Company. Bridging AI capability and real-world application.'}
          </p>
        </div>
      </div>
    </section>
  )
}
