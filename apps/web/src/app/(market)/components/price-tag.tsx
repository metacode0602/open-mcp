import { cn } from "@repo/ui/lib/utils"

interface PriceTagProps {
  price: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PriceTag({ price, className, size = "sm" }: PriceTagProps) {
  const isFree = price === 0

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-lg px-3 py-1.5 font-bold",
  }

  if (isFree) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md bg-primary/10 font-medium text-primary",
          sizeClasses[size],
          className
        )}
      >
        {"Free"}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-foreground/5 font-semibold text-foreground",
        sizeClasses[size],
        className
      )}
    >
      {"$"}{price}
    </span>
  )
}
