import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's image-optimization quota was exhausted (402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED), which broke every image on
    // the site. Serve images directly from Supabase storage instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
};

export default nextConfig;
