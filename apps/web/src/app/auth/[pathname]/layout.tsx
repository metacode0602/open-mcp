import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { MainNav } from "@/app/(protected)/web/main-nav";
import { ThemeProvider } from "@/components/theme-provider";

export default async function LoginUserLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`antialiased min-h-screen bg-background`}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <MainNav />
        </header>
        <div className="relative flex  flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
        <Toaster />

      </ThemeProvider>
      <Toaster />
    </div>
  );
}
