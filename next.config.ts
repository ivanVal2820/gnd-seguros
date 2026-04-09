import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/seguros",
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;