import type { NextConfig } from "next";

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
const mediaUrl = mediaBase ? new URL(mediaBase) : null;

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(mediaUrl
        ? [
            {
              protocol: mediaUrl.protocol.replace(":", ""),
              hostname: mediaUrl.hostname,
              port: mediaUrl.port,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
