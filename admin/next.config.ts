import type { NextConfig } from "next";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = (configuredApiBaseUrl || (process.env.NODE_ENV === "development" ? "http://localhost:8081" : "https://basecamp-api.tiesverse.com")).replace(/\/$/, "");

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
      {
        source: "/actuator/:path*",
        destination: `${apiBaseUrl}/actuator/:path*`,
      },
    ];
  },
};

export default nextConfig;
