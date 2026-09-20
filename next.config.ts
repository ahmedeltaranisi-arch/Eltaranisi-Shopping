import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      { protocol: "https", hostname: "ecommerce.routemisr.com" },
      { protocol: "https", hostname: "placehold.co" }, // للفولباك بتاع السلة
    ],
  },
  
};

export default nextConfig;
