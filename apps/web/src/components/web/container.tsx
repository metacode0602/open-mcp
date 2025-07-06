import { cn } from "@repo/ui/lib/utils"
import type React from "react"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Container({ children, className, as: Component = "div" }: ContainerProps) {
  return <Component className={cn("container px-4 md:px-6 mx-auto max-w-7xl", className)}>{children}</Component>
}

