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
  async headers() {
    const responseSecurityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    // Emit HSTS only in production, where the public storefront uses HTTPS.
    if (process.env.NODE_ENV === "production") {
      responseSecurityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }

    return [
      {
        source: "/:path*",
        headers: responseSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
