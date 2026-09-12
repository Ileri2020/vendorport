import type { NextConfig } from "next";
import path from "path";

const staticAssetExtensions = [
  "woff2", "woff", "ttf", "otf", "eot", "ico", "png", "webp",
  "svg", "jpg", "jpeg", "gif", "css", "js",
];

const nextConfig: NextConfig = {
  compress: true, // Enable gzip/brotli compression for all responses
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Explicitly set Turbopack root to suppress the "multiple lockfiles" warning
  // caused by the parent commerce/package-lock.json being detected
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Cache headers for static assets + CORS for API routes
  headers: async () => {
    return [
      // Long-lived cache for static public files (fonts, icons, placeholders, logo).
      ...staticAssetExtensions.map((extension) => ({
        source: `/:path*.${extension}`,
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      })),
      // CDN cache for Cloudinary image proxies (shorter since URLs can change)
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      // CORS for all API routes
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      // Default CORS for other routes
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
