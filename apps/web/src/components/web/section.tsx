import { cn } from "@repo/ui/lib/utils"
import type React from "react"

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  background?: "default" | "muted" | "gradient" | "primary"
}

export function Section({ children, className, background = "default", id }: SectionProps) {
  const backgroundClasses = {
    default: "bg-background",
    muted: "bg-muted/20",
    gradient: "bg-gradient-to-b from-muted/50 to-background",
    primary: "bg-gradient-to-r from-primary/5 to-background",
  }

  return (
    <section id={id} className={cn("w-full py-6 md:py-8 lg:py-10", backgroundClasses[background], className)}>
      {children}
    </section>
  )
}

