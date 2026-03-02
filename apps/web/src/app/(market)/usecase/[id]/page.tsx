import { notFound } from "next/navigation"
import { UsecaseDetail } from "../components/usecase-detail"
import { usecases, getUsecaseById } from "@/lib/types"
import type { Metadata } from "next"

export async function generateStaticParams() {
  return usecases.map((uc) => ({ id: uc.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const uc = getUsecaseById(id)
  if (!uc) return { title: "案例未找到" }
  return {
    title: `${uc.title} - OpenClaw Usecases`,
    description: uc.description,
  }
}

export default async function UsecasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const uc = getUsecaseById(id)
  if (!uc) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <UsecaseDetail uc={uc} />
      </main>
      <SiteFooter />
    </div>
  )
}
