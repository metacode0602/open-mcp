import type { ReactNode } from "react"
import type { Graph } from "schema-dts"

import { Footer } from "@/components/footer"
import { Header } from "@/components/web/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { config } from "@/lib/config"
import Script from "next/script"

export default function WebLayout({
  children,
}: {
  children: ReactNode
}) {
  const url = config.site.url
  const jsonLd: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#/schema/organization/1`,
        name: config.site.name,
        url: `${url}/`,
        sameAs: [
          config.links.twitter,
          config.links.bluesky,
          config.links.mastodon,
          config.links.linkedin,
          config.links.github,
        ],
        logo: {
          "@type": "ImageObject",
          "@id": `${url}/#/schema/image/1`,
          url: `${url}/favicon.png`,
          width: "480",
          height: "480",
          caption: `${config.site.name} Logo`,
        },
      },
      {
        "@type": "Person",
        "@id": `${url}/#/schema/person/1`,
        name: "Piotr Kulpinski",
        sameAs: [config.links.author],
      },
      {
        "@type": "WebSite",
        url: config.site.url,
        name: config.site.name,
        description: config.site.description,
        inLanguage: "zh-CN",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        } as any,
        isPartOf: { "@id": `${url}#/schema/website/1` },
        about: { "@id": `${url}#/schema/organization/1` },
      },
    ],
  }
  return (
    <div className="antialiased min-h-screen bg-background">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
      {/* JSON-LD */}
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}

