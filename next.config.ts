import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  headers: async () => [
    {
      source: "/_next/image",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, max-age=0",
        },
      ],
    },
  ],
};

export default nextConfig;
