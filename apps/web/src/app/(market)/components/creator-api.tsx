import Link from "next/link"
import { Zap, Bot, RefreshCw, ArrowRight } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@repo/ui/components/ui/card"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@repo/ui/lib/utils"

const CODE_SNIPPET = `# Create a listing
curl -X POST https://www.shopclawmart.com/api/v1/listings \\
  -H "Authorization: Bearer $CLAWMART_API_KEY" \\
  -d '{"type":"skill","name":"My Skill",...}'

# Upload a package
curl -X POST .../listings/{id}/versions \\
  -F "package=@SKILL.md" \\
  -F "changelog=Initial release"

# Or let your AI do it
"Create a skill on ClawMart for daily standup summaries"
`

const FEATURES = [
  {
    icon: Zap,
    title: "One command to publish",
    text: "Create a listing and upload your package in seconds",
  },
  {
    icon: Bot,
    title: "AI-native workflow",
    text: "Your OpenClaw can build and publish skills autonomously",
  },
  {
    icon: RefreshCw,
    title: "Version management",
    text: "Push updates and your buyers get them automatically",
  },
] as const

export function CreatorApi() {
  return (
    <section className="border-t border-border bg-card px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Creator API
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Publish skills from your terminal
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Build a skill or persona, then ship it to ClawMart with a single
              API call. Your AI assistant can create listings, upload packages,
              and manage versions — all programmatically.
            </p>
            <ul className="mt-6 space-y-3" role="list">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary" aria-hidden>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <strong className="font-medium text-foreground">{title}</strong>
                    {" — "}
                    {text}
                  </p>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 rounded-xl">
              <Link href="/login">
                Get your API key
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Card
            className={cn(
              "overflow-hidden border-border bg-muted/50 font-mono text-sm",
              "rounded-2xl"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">
                terminal
              </span>
              <CopyButton text={CODE_SNIPPET} />
            </CardHeader>
            <CardContent className="p-0">
              <pre className="overflow-x-auto p-6">
                <code className="font-mono text-sm leading-relaxed text-muted-foreground">
                  {CODE_SNIPPET}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
