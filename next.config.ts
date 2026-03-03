import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // remove once all covers are migrated to Vercel Blob
    remotePatterns: [
      { protocol: "https", hostname: "bilder.buecher.de" },       // legacy, will be phased out
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }, // Vercel Blob
      { protocol: "https", hostname: "**.bing.net" },
      { protocol: "https", hostname: "api.ardmediathek.de" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
