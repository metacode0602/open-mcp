import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["@repo/db", "@repo/email", "@repo/github"],
};

export default nextConfig;
