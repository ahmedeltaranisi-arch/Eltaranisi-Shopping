import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ecommerce.routemisr.com" },
      { protocol: "https", hostname: "placehold.co" }, // للفولباك بتاع السلة
    ],
  },
  async redirects() {
    return [
      // لينك قديم كان بيحوّل لصفحة الأوردرات
      { source: "/allorders", destination: "/orders", permanent: false },
    ];
  },
};

export default nextConfig;
