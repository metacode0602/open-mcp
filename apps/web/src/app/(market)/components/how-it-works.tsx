import { cn } from "@repo/ui/lib/utils"

const STEPS = [
  {
    step: 1,
    title: "Browse & Buy",
    description:
      "Find a persona or skill that fits your workflow. Pay once, use forever.",
  },
  {
    step: 2,
    title: "Download & Install",
    description:
      "Get the config files, prompts, and setup guide. Install in minutes.",
  },
  {
    step: 3,
    title: "Ship Real Work",
    description:
      "Your AI assistant is ready. Start delegating tasks immediately.",
  },
] as const

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-card px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-foreground">
          How it works
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ step, title, description }) => (
            <div key={step} className="flex flex-col">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary"
                )}
              >
                {step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
