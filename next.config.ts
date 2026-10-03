import type { NextConfig } from "next";

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
};

export default nextConfig;
