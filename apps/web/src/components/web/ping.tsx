import { cn } from "@repo/ui/lib/utils"
import type { ComponentProps } from "react"

export const Ping = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={cn("relative size-3", className)} {...props}>
      <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-30 pointer-events-none blur-[1px]" />
      <div className="absolute inset-0 animate-pulse rounded-full bg-current opacity-30 pointer-events-none" />
      <div className="absolute inset-[2px] rounded-full bg-current" />
    </div>
  )
}
