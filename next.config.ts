import type { NextConfig } from "next";

const backendInternalUrl = process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(process.env.NEXT_PUBLIC_MEDIA_BASE_URL
        ? (() => {
            const url = new URL(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
            return [
              {
                protocol: url.protocol.replace(":", "") as "http" | "https",
                hostname: url.hostname,
                port: url.port,
                pathname: "/**",
              },
            ];
          })()
        : []),
    ],
  },
  async rewrites() {
    if (!backendInternalUrl) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendInternalUrl}/api/v1/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${backendInternalUrl}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendInternalUrl}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
