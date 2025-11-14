import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.png", permanent: true },
    ];
  },
  images: {
    domains: [
      "ipalas3bucket.s3.us-east-2.amazonaws.com",
      "repairfindbucket.s3.eu-west-3.amazonaws.com",
      "/lh3.googleusercontent.com",
      "picsum.photos",
      "unsplash.com",
      "example.com",
      "placehold.co",
    ], // Include other domains as needed

    remotePatterns: [
      {
        protocol: "https",
        hostname: "repairfindbucket.s3-eu-west-3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipalas3bucket.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // ⚠️ Temporary: don't fail production builds because of ESLint errors
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
export default nextConfig;
