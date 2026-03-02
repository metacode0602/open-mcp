"use client"

import { useState } from "react"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

interface PurchaseButtonProps {
  price: number
  itemName: string
  itemType: "skill" | "usecase" | "persona"
  className?: string
}

export function PurchaseButton({ price, itemName, itemType, className }: PurchaseButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle")

  const isFree = price === 0

  const handlePurchase = async () => {
    setState("loading")

    // Simulated purchase flow
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setState("success")

    // Reset after showing success
    setTimeout(() => setState("idle"), 2000)
  }

  const typeLabels: Record<string, string> = {
    skill: "Skill",
    usecase: "Case",
    persona: "Persona",
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={state !== "idle"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all",
        state === "success"
          ? "bg-primary/20 text-primary"
          : isFree
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-foreground text-background hover:bg-foreground/90",
        state === "loading" && "opacity-80",
        className
      )}
    >
      {state === "loading" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {"Processing..."}
        </>
      ) : state === "success" ? (
        <>
          <Check className="h-4 w-4" />
          {isFree ? "Added" : "Purchased"}
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          {isFree ? (
            <>{"Free"} &middot; {"Install "}{typeLabels[itemType]}</>
          ) : (
            <>{"$"}{price} &middot; {"Buy "}{typeLabels[itemType]}</>
          )}
        </>
      )}
    </button>
  )
}
