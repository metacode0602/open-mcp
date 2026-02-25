import { cn } from "@repo/ui/lib/utils"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type React from "react"

import { getAssetUrl } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  icon?: string
  description?: string
  backLink?: {
    href: string
    label: string
  }
  className?: string
  children?: React.ReactNode
  align?: "left" | "center"
}

export function PageHeader({ title, description, backLink, className, children, align = "left", icon }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", align === "center" && "text-center", className)}>
      {backLink && (
        <div className="mb-3 sm:mb-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation py-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            {backLink.label}
          </Link>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {icon && (
          <Image
            src={icon}
            alt={title}
            width={64}
            height={64}
            className="rounded-lg w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl mb-1 sm:mb-2 break-words">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-[85ch]">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

