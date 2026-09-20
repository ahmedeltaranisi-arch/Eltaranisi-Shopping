import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ecommerce.routemisr.com" },
      { protocol: "https", hostname: "placehold.co" }, // للفولباك بتاع السلة
    ],
  },
  typescript: {
    // تجاهل أخطاء TypeScript أثناء عملية الـ build على Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // تجاهل أخطاء ESLint أثناء عملية الـ build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
