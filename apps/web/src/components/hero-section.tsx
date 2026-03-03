
import { SearchBar } from "@/components/search-bar"
import { Container } from "@/components/web/container"
import { CountBadge } from "@/components/web/count-badge"
import { LogoIcon } from "@/components/web/logo-icon"
import { Section } from "@/components/web/section"

export function HeroSection() {
  return (
    <Section background="gradient">
      <Container>
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 px-1">
          <CountBadge />
          <div className="flex items-center gap-2 mb-2 sm:mb-4">
            <LogoIcon type="openmcp" size="xl" className="shrink-0" />
            <span className="text-2xl sm:text-3xl font-bold">Open MCP</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold tracking-tighter sm:text-xl md:text-2xl xl:text-3xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 px-1">
              AI 助手的应用商店
            </h1>
            <p className="max-w-4xl text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl mx-auto px-1">
              Personas 角色配置包与 Skills 技能组件，弥合 AI 能力与实际应用之间的差距。探索、购买并一键部署，由真实运营 AI 助手的创作者打造。
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-6 sm:mb-10 w-full">
          <SearchBar className="shadow-lg" />
        </div>
      </Container>
    </Section>
  )
}

