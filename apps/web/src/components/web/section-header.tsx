import { Button } from "@repo/ui/components/ui/button"
import { cn } from "@repo/ui/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface SectionHeaderProps {
  title: string
  description?: string
  viewAllLink?: string
  viewAllLabel?: string
  className?: string
  align?: "left" | "center"
}

export function SectionHeader({
  title,
  description,
  viewAllLink,
  viewAllLabel = "查看全部",
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-6 sm:mb-8",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-sm sm:text-base mt-1">{description}</p>
        )}
      </div>
      {viewAllLink && (
        <Button variant="outline" size="sm" className="shrink-0 touch-manipulation" asChild>
          <Link href={viewAllLink}>
            {viewAllLabel}
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </Button>
      )}
    </div>
  )
}

