import type { NextConfig } from "next";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = configuredApiBaseUrl?.replace(/\/$/, "")
  || (process.env.NODE_ENV === "development"
    ? "http://localhost:8081"
    : (() => {
        throw new Error("NEXT_PUBLIC_API_BASE_URL must be set for production builds");
      })());

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiBaseUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
