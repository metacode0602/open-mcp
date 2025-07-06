import type { Metadata } from "next"
import { linksConfig } from "./links"
import { siteConfig } from "./site"

export const metadataConfig: Metadata = {
  openGraph: {
    url: "/",
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website",
    images: { url: `${siteConfig.url}/opengraph.png`, width: 1200, height: 630 },
  },
  twitter: {
    site: "@open-mcp",
    creator: "@open-mcp",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": linksConfig.feeds },
  },
}
