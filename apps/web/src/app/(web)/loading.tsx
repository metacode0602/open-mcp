import { Skeleton } from "@repo/ui/components/ui/skeleton"

import { Container } from "@/components/web/container"
import { Section } from "@/components/web/section"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <Section>
          <Container>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Skeleton className="h-12 w-[250px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[280px]" />
                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="hidden lg:block">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            </div>
          </Container>
        </Section>

        {/* Ad Skeleton */}
        <Section>
          <Container>
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </Container>
        </Section>

        {/* OpenMCP Studio Promo Skeleton */}
        <Section background="muted">
          <Container>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="h-4 w-[280px]" />
              </div>
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
          </Container>
        </Section>

        {/* Category Sections Skeleton */}
        {[1, 2, 3].map((index) => (
          <Section key={index} background={index % 2 ? "muted" : undefined}>
            <Container>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-[200px] mx-auto" />
                  <Skeleton className="h-4 w-[300px] mx-auto" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border p-6">
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-6 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Container>
          </Section>
        ))}

        {/* Deploy Section Skeleton */}
        <Section background="muted">
          <Container>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Skeleton className="h-8 w-[300px]" />
                <Skeleton className="h-4 w-[250px]" />
                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <Skeleton className="h-[300px] rounded-lg" />
            </div>
          </Container>
        </Section>

        {/* Latest News Section Skeleton */}
        <Section>
          <Container>
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-[200px] mx-auto" />
                <Skeleton className="h-4 w-[300px] mx-auto" />
              </div>
              <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-[200px]" />
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  )
}

