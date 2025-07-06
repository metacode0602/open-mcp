"use client"

import { Button } from "@repo/ui/components/ui/button"
import { ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function DeployButton() {

  return (
    <Button
      size="lg"
      className="gap-1"
      onClick={() => {
        toast.info("即将上线", {
          description: "部署功能即将上线，敬请期待",
        })
      }}
    >
      开始部署
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}