import { Suspense } from "react"
import { notFound } from "next/navigation"
import { RankingRecords } from "./ranking-records"
import { Skeleton } from "@repo/ui/components/ui/skeleton"


export default async function RankingRecordsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // 在实际应用中，这里应该检查ID是否有效
  if (!id) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<RecordsSkeleton />}>
        <RankingRecords id={id} />
      </Suspense>
    </div>
  )
}

function RecordsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Skeleton className="h-10 w-[250px]" />
      </div>
      <div className="border rounded-lg">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
