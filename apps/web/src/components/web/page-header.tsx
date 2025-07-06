import { cn } from "@repo/ui/lib/utils"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type React from "react"

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
    <div className={cn("mb-8", align === "center" && "text-center", className)}>
      {backLink && (
        <div className="mb-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLink.label}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-2">
        {icon && <Image src={(icon)} alt={title} width={64} height={64} className="rounded-lg" />}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">{title}</h1>
          {description && <p className="text-muted-foreground max-w-[85ch]">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

