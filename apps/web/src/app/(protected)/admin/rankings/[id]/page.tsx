"use client"

import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { notFound } from "next/navigation"
import { Suspense, use } from "react"

import { trpc } from "@/lib/trpc/client"

import { RankingDetails } from "./ranking-details"


export default function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: ranking, isLoading } = trpc.rankings.getById.useQuery({
    id
  })

  if (isLoading) {
    return <div>加载中...</div>
  }

  if (!ranking) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<DetailsSkeleton />}>
        <RankingDetails id={id} />
      </Suspense>
    </div>
  )
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Skeleton className="h-10 w-[250px]" />
      </div>
      <div className="grid gap-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}
