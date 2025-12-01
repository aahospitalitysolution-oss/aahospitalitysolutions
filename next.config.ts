import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Configure caching headers for optimized frame loading
  headers: async () => [
    {
      // Cache frame images for 1 year (immutable assets)
      source: "/frames/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      // Cache other static images for 1 week
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=604800, stale-while-revalidate=86400",
        },
      ],
    },
  ],
};

export default nextConfig;
