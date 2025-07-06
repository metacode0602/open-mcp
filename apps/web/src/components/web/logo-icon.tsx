import { cn } from "@repo/ui/lib/utils"

import { OpenMCPLogo, OpenMCPStudioLogo } from "@/components/icons"

interface LogoIconProps {
  type: "openmcp" | "studio"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function LogoIcon({ type, size = "md", className }: LogoIconProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  }

  const Logo = type === "openmcp" ? OpenMCPLogo : OpenMCPStudioLogo

  return <Logo className={cn("text-primary", sizeClasses[size], className)} />
}

