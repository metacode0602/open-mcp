import localFont from "next/font/local";
import "./styles/globals.css";
import { cn } from "@repo/ui/lib/utils";
import { RootProvider } from "fumadocs-ui/provider";
import { description } from "./layout.config";
import { baseUrl, createMetadata } from "@/lib/metadata";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata = createMetadata({
  title: {
    template: "%s | OpenMCP",
    default: "OpenMCP",
  },
  description: description,
  metadataBase: baseUrl,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          crossOrigin="anonymous"
          src="//cdn.jsdelivr.net/npm/meta-scan@0.15.0/dist/auto.global.js"
          data-auto-enable={"false"}
        />
      </head>
      <body
        className={cn("relative flex min-h-svh flex-col overflow-x-hidden")}
      >
        <RootProvider
          search={{
            options: {
              type: "static",
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
