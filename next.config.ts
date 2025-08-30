import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ⚠️ Temporary: don't fail production builds because of ESLint errors
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
