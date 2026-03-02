import { HeroSection } from "./components/hero-section"
import { StatsSection } from "./components/stats-section"
import { PersonaSection } from "./components/persona-section"
import { UsecaseGrid } from "./usecase/components/usecase-grid"
import { ClawsourcingPreview } from "./clawsourcing/components/clawsourcing-preview"
import { CreatorCta } from "./components/creator-cta"

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <StatsSection />
      <PersonaSection />
      <UsecaseGrid />
      <ClawsourcingPreview />
      <CreatorCta />
    </main>
  )
}
