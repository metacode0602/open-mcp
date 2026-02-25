
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "./components/stats-section"
import { UsecaseGrid } from "./components/usecase-grid"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <UsecaseGrid />
      </main>
    </div>
  )
}
