import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.NTSPIRE_NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
