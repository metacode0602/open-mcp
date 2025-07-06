"use client"

import { McpApp } from "@repo/db/types";
import { Button } from "@repo/ui/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils"
interface RelatedAppsProps {
  currentApp: McpApp
}

export function RelatedApps({ currentApp }: RelatedAppsProps) {
  const { data: relatedApps, isLoading } = trpc.mcpRelatedApps.getRelatedApps.useQuery({
    type: currentApp.type,
    appId: currentApp.id,
  })
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!relatedApps || relatedApps.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">暂无相关应用</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {relatedApps.slice(0, 3).map((app) => (
        <div key={app.slug} className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {app.icon ? (
              <Image
                src={getAssetUrl(app.icon) || "/placeholder.svg"}
                alt={app.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="text-lg font-bold">{app.name.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{app.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-1">{app.description}</p>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
              <Link href={`/apps/${app.slug}`}>
                查看详情
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

