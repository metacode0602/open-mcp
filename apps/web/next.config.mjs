// const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // assetPrefix: isProd ? "https://zenly.oss-cn-hangzhou.aliyuncs.com/mcp" : "",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yilabao-img.oss-cn-beijing.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "zenly.oss-cn-hangzhou.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "wework.qpic.cn",
      },
      {
        protocol: "https",
        hostname: "rescdn.qqmail.com",
      },
      {
        protocol: "http",
        hostname: "localhost"
      }
    ],
  },
  transpilePackages: ["@repo/ui", "@repo/db", "@repo/email", "@repo/github", "@repo/trpc"],
}

export default nextConfig
