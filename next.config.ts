import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.happypaws.lk",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5047",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
