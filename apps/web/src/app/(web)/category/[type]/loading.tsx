import { Skeleton } from "@repo/ui/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-5 w-full max-w-md mb-6" />

      <Skeleton className="h-12 w-full mb-8" />

      <Skeleton className="h-8 w-40 mb-2" />
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20" />
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  )
}

