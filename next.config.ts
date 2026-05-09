import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws", "arweave"],
  turbopack: {},
};

export default nextConfig;
