
import { Button } from "@repo/ui/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { LoginForm } from "@/components/auth/signin-form"
export function AuthView() {


  return (
    <main className="flex grow flex-col items-center justify-center gap-4 p-4">
      <LoginForm />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>
      </Button>
    </main>
  )
}
