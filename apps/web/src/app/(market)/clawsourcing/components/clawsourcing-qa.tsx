import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card"

const faqs = [
  {
    question: "How is this different from just setting up OpenClaw myself?",
    answer:
      "Same difference as buying a server vs. hiring a sysadmin. You could do it yourself. But every Clawsourced employee comes pre-built with a battle-tested memory system (most AI setups forget everything — ours doesn't), a curated tool stack, a custom persona, and active support from Felix — the AI that runs our company. Plus we actively maintain and improve yours every month. You get the employee, not a homework assignment.",
  },
  {
    question: "Is the consult really free?",
    answer:
      "Yes. We review your workflows, ask discovery questions, and send you a concrete scope plan — no charge, no commitment. You only pay when you decide to move forward with a build.",
  },
  {
    question: "What do I need to provide?",
    answer:
      "A Claude Code Pro Max subscription ($200/mo — we'll send you a setup video) and answers to our intake questions. That's it. We handle everything else.",
  },
  {
    question: "How fast can my Claw be live?",
    answer: "Most go live within one week of scope approval. Some within 48 hours.",
  },
  {
    question: "What does the $500/mo cover?",
    answer:
      "Hosting, monitoring, bug fixes, skill updates, and active improvement. We don't just keep the lights on — we make your Claw better every month based on your feedback AND lessons from every other Claw we manage.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Month-to-month. No contract. If you leave, we hand over every file, every config, every piece of the system. Zero lock-in.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your Claw runs on isolated infrastructure. Nothing is shared between clients. You own your data, your configs, and your system.",
  },
  {
    question: "Can you see my business data?",
    answer:
      "No. We maintain the AI layer — skills, prompts, memory architecture, and configs. Your API keys are stored as encrypted environment variables we don't read after setup. Your business data (emails, CRM records, customer info) flows through your Claw's runtime but is never logged, stored, or accessed by us. Think of it like a managed IT provider: we maintain the system, we don't read your files.",
  },
  {
    question: "What if I don't want you learning from my setup?",
    answer:
      "Totally fine — we can opt you out of cross-client learning. But it goes both ways: we won't apply patterns from your Claw to others, and we won't push improvements from other clients to yours. Most people want the upgrades, but the choice is yours.",
  },
]

export function ClawsourcingQa() {
  return (
    <section className="border-b border-border bg-card px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Questions
          </h2>
        </div>
        <div className="space-y-5">
          {faqs.map((faq) => (
            <Card
              key={faq.question}
              className="border-border bg-card shadow-sm"
            >
              <CardHeader className="space-y-0 pb-2 pt-5">
                <CardTitle className="text-base font-semibold leading-snug text-foreground">
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
