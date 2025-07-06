import type { ComponentProps } from "react"
import { cn } from "@repo/ui/lib/utils"

export const Ping = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("relative size-3 text-primary", className)} {...props}>
      <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-30 pointer-events-none blur-[1px]" />
      <div className="absolute inset-0 animate-pulse rounded-full bg-current opacity-30 pointer-events-none" />
      <div className="absolute inset-[3px] rounded-full bg-current" />
    </div>
  )
}
