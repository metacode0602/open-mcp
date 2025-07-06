"use client"

import { ArrowRight, Rocket } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { cn } from "@repo/ui/lib/utils"
import { useState } from "react"

export function DeployButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          className={cn(
            "gap-2 transition-all duration-300 group",
            isOpen && "bg-primary/90 ring-2 ring-primary ring-offset-2"
          )}
        >
          <Rocket
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isOpen ? "rotate-45" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            )}
          />
          开始部署
          <ArrowRight className={cn(
            "h-4 w-4 transition-transform duration-300",
            isOpen ? "-rotate-45" : "group-hover:translate-x-1"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] backdrop-blur-sm bg-card/95"
        sideOffset={8}
      >
        <div className="grid gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-lg leading-none">即将上线</h4>
            </div>
            <div className="pl-7">
              <p className="text-sm text-muted-foreground leading-relaxed">
                部署功能正在开发中，我们将为您带来便捷的一键部署体验，敬请期待。
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

