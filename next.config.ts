import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uvwelrqlezpkgqtfmtbb.supabase.co",
        pathname: "/storage/v1/object/public/item_photos/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "24mb",
    },
  },
};

export default nextConfig;
