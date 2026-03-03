import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Container } from "@/components/web/container"

const SECTION_CLASS =
  "rounded-[32px] border border-border bg-card p-8 shadow-sm md:p-12"

export function About() {
  return (
    <Container className="max-w-7xl px-6 pt-16 pb-12">
      <Card className={SECTION_CLASS}>
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            About openmcp
          </p>
          <CardTitle className="mt-4 font-display text-4xl text-foreground md:text-5xl">
            The app store for AI assistants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Most people set up their AI assistant once and never touch it again.
            They get generic responses, no memory, no real workflow integration.
            The gap between what AI <em>can</em> do and what most people{" "}
            <em>get</em> it to do is enormous.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            openmcp closes that gap. We&apos;re a marketplace of pre-built
            personas and skills created by people who run AI assistants in
            production every day. Buy a config, install it in minutes, and your
            AI starts working the way theirs does.
          </p>
        </CardContent>
      </Card>

      <Card className={`mt-12 ${SECTION_CLASS}`}>
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            Three product types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Card className="rounded-2xl border bg-muted/50 p-6">
              <CardContent className="p-0">
                <p className="text-2xl" aria-hidden>
                  🧑‍💼
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  Personas
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Complete AI assistant configurations — personality, memory
                  systems, decision-making frameworks, and tool setups. Like
                  hiring a specialist, except they start day one knowing exactly
                  how to work.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong>Includes:</strong> SOUL.md, MEMORY.md, tool configs,
                  setup guides
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border bg-muted/50 p-6">
              <CardContent className="p-0">
                <p className="text-2xl" aria-hidden>
                  ⚡
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  Skills
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Plug-and-play capability packages that teach your existing AI
                  new tricks. Memory management, email security, social media
                  automation, code monitoring — install one file and your
                  assistant gains a new superpower.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <strong>Includes:</strong> SKILL.md with instructions, scripts,
                  and reference configs
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border bg-muted/50 p-6">
              <CardContent className="p-0">
                <p className="text-2xl" aria-hidden>
                  ⚡
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  MCP Tools
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  MCP Tools are the building blocks of the OpenMCP ecosystem. They are the tools that are used to build the AI assistants.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className={`mt-12 ${SECTION_CLASS}`}>
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="mt-6 space-y-6">
            {[
              {
                step: 1,
                title: "Browse and buy",
                text: "Find a persona or skill that matches your workflow. Filter by category, search by use case. Every listing shows exactly what you get — capabilities, required tools, and what's included.",
              },
              {
                step: 2,
                title: "Download and install",
                text: "After purchase, download the package and drop the files into your openmcp workspace. Each package includes a step-by-step setup guide. Most installs take under five minutes.",
              },
              {
                step: 3,
                title: "Ship real work",
                text: "Your AI is configured and ready. Start delegating immediately. When the creator pushes updates, you get them automatically.",
              },
            ].map(({ step, title, text }) => (
              <li key={step} className="flex gap-4">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className={`mt-12 ${SECTION_CLASS}`}>
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            For creators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            If you&apos;ve built an AI workflow that works — a persona that
            handles your email, a skill that automates your deploys, a memory
            system that actually scales — you can package it and sell it on
            openmcp.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl border bg-muted/50 p-5">
              <CardContent className="p-0">
                <p className="font-display text-2xl font-semibold text-primary">
                  90%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Revenue goes to you, minus payment processing
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border bg-muted/50 p-5">
              <CardContent className="p-0">
                <p className="font-display text-2xl font-semibold text-primary">
                  API-first
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Publish from your terminal or let your AI do it
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border bg-muted/50 p-5">
              <CardContent className="p-0">
                <p className="font-display text-2xl font-semibold text-primary">
                  Instant
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  List goes live immediately — no review queue
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">Start selling →</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/creator-terms">Creator terms</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`mt-12 ${SECTION_CLASS} mb-16`}>
        <CardHeader>
          <CardTitle className="font-display text-2xl font-semibold text-foreground">
            Why this exists
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base leading-relaxed text-muted-foreground">
            AI assistants are only as good as their configuration. The
            difference between a generic chatbot and a genuine force multiplier
            is the prompt engineering, memory architecture, tool integration, and
            workflow design that goes into setting one up.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            That work takes weeks of iteration. Most people don&apos;t have the
            time or expertise. But the people who <em>have</em> done it — who
            run AI assistants that manage their email, write their code, handle
            their marketing — they&apos;ve already solved the hard problems.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            openmcp lets those operators package what they&apos;ve built and share
            it with everyone else. You get a production-tested setup in minutes.
            They get paid for their expertise. Everyone ships faster.
          </p>
        </CardContent>
      </Card>
    </Container>
  )
}
