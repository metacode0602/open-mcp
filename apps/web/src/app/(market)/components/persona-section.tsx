"use client"

import Image from "next/image"
import {
  Crown,
  Code,
  Megaphone,
  Headphones,
  Settings,
  BadgeCheck,
  Check,
  ArrowRight,
} from "lucide-react"
import { personas, personaCategories, type Persona } from "@/lib/types"
import { PriceTag } from "./price-tag"

const categoryIcons: Record<string, React.ReactNode> = {
  Crown: <Crown className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Megaphone: <Megaphone className="h-4 w-4" />,
  Headphones: <Headphones className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
}

function PersonaCard({ persona }: { persona: Persona }) {
  const cat = personaCategories[persona.category]

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:bg-accent/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {categoryIcons[cat.icon]}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {cat.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {persona.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
          <PriceTag price={persona.price} />
        </div>
      </div>

      <h3 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {persona.name}
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">{persona.subtitle}</p>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {persona.description}
      </p>

      <ul className="mb-4 flex flex-col gap-1.5">
        {persona.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-2">
          {persona.authorInfo.avatar ? (
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-secondary">
              <Image
                src={persona.authorInfo.avatar}
                alt={persona.authorInfo.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
              {persona.authorInfo.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {persona.authorInfo.name}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {'查看详情'}
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  )
}

export function PersonaSection() {
  return (
    <section id="marketplace" className="border-b border-border px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Personas
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {'Personas 角色配置包'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {'完整的 AI 助手配置，包含个性、记忆系统、决策框架和工具设置。购买后几分钟内完成安装。'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{'创作者获得'}</span>
            <span className="font-bold text-primary">90%</span>
            <span>{'收入分成'}</span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      </div>
    </section>
  )
}
