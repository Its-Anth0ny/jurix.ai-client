import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeServerReact: false,
  },
};

export default nextConfig;
