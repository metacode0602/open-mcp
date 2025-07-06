import Script from "next/script";
import { IUmamiProviderProps } from "./type";
import React from "react";
const isDev = process.env.NODE_ENV === "development";
const UMAMI_SRC = process?.env?.NEXT_PUBLIC_UMAMI_SRC ?? "https://umami.julianshuke.top/script.js";
const UMAMI_WEBSITE_ID = process?.env?.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_HOST_URL = process?.env?.NEXT_PUBLIC_UMAMI_HOST_URL;

export const UmamiProvider = ({
  src = UMAMI_SRC,
  websiteId = UMAMI_WEBSITE_ID,
  hostUrl = UMAMI_HOST_URL,
  autoTrack = true,
  domains = [],
  ...props
}: IUmamiProviderProps) => {
  if (!src && !isDev) {
    console.warn("track.umami.src is not found");
  }
  if (!websiteId) {
    isDev && console.warn("track.umami.data-website-id is not found");
    return null;
  }

  return (
    <Script
      src={src}
      data-website-id={websiteId}
      data-auto-track={autoTrack}
      {...(hostUrl && { "data-host-url": hostUrl })}
      {...(domains.length > 0 && { "data-domains": domains.join(",") })}
      strategy='afterInteractive'
      {...props}
    />
  );
};
