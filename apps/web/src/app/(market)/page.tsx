import { HeroSection } from "./components/hero-section"
import { StatsSection } from "./components/stats-section"
import { PersonaSection } from "./components/persona-section"
import { PersonasGrid } from "./personas/components/personas-grid"
import { ClawsourcingPreview } from "./clawsourcing/components/clawsourcing-preview"
import { CreatorCta } from "./components/creator-cta"
import { Cta } from "./components/cta"
import { FeaturedCreators } from "./components/featured-creators"
import { HowItWorks } from "./components/how-it-works"
import { CreatorApi } from "./components/creator-api"
export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <StatsSection />
      <PersonaSection />
      <PersonasGrid />
      <FeaturedCreators />
      <HowItWorks />
      <CreatorApi />
      <ClawsourcingPreview />
      <CreatorCta />
    </main>
  )
}
