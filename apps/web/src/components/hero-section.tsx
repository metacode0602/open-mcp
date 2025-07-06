
import { SearchBar } from "@/components/search-bar"
import { Container } from "@/components/web/container"
import { LogoIcon } from "@/components/web/logo-icon"
import { Section } from "@/components/web/section"
import { CountBadge } from "@/components/web/count-badge"

export function HeroSection() {
  return (
    <Section background="gradient">
      <Container>
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <CountBadge />
          <div className="flex items-center gap-2 mb-4">
            <LogoIcon type="openmcp" size="xl" />
            <span className="text-3xl font-bold">Open MCP</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl xl:text-3xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              一站式 AI 全聚合平台，专注于 MCP 生态系统
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
              探索 MCP 客户端、服务器和开源应用的综合导航平台，一键部署您的 MCP 服务
            </p>
          </div>
        </div>

        {/* 突出显示的搜索框 */}
        <div className="max-w-3xl mx-auto mb-10">
          <SearchBar className="shadow-lg" />
        </div>
      </Container>
    </Section>
  )
}

