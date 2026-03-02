import Link from "next/link"
import { Button } from "@repo/ui/components/ui/button"

export function Cta() {
  return (
    <section className="border-t border-border bg-muted/60 px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold text-foreground">
          Ready to build?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Create and sell your own AI personas and skills. Keep 90% of every
          sale, minus payment processing fees.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/creator/submit">Start Selling</Link>
        </Button>
      </div>
    </section>
  )
}
