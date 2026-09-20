import React from "react";
import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export default function PromoBanners() {
  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ================= CARD 1: GREEN / DEALS ================= */}
        <div
          data-aos="fade-right"
          className="relative overflow-hidden rounded-2xl p-4 sm:p-8 md:p-8 bg-gradient-to-r from-[#008A5E] via-[#009E6B] to-[#00B077] text-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[260px]"
        >
          {/* خلفيات دوائر شفافة تجميلية (Top Right & Bottom Left) */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none blur-sm" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none blur-sm" />

          {/* محتوى البطاقة العلوي */}
          <div className="relative z-10 flex flex-col items-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-4">
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
              <span>Deal of the Day</span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Fresh Organic Fruits
            </h3>
            <p className="text-sm sm:text-base text-white/85 font-normal mb-6">
              Get up to 40% off on selected organic fruits
            </p>

            {/* Price / Discount Info */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl sm:text-3xl font-black">40% OFF</span>
              <span className="text-xs sm:text-sm text-white/90">
                Use code: <strong className="font-bold">ORGANIC40</strong>
              </span>
            </div>
          </div>

          {/* Button */}
          <div className="relative z-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#008A5E] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:gap-3 shadow-sm"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ================= CARD 2: ORANGE / NEW ARRIVALS ================= */}
        <div
          data-aos="fade-left"
          className="relative overflow-hidden rounded-2xl p-4 sm:p-8 md:p-8 bg-gradient-to-r from-[#FF5E13] via-[#FF453A] to-[#FF2A6D] text-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[260px]"
        >
          {/* خلفيات دوائر شفافة تجميلية (Top Right & Bottom Left) */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none blur-sm" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none blur-sm" />

          {/* محتوى البطاقة العلوي */}
          <div className="relative z-10 flex flex-col items-start">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>New Arrivals</span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Exotic Vegetables
            </h3>
            <p className="text-sm sm:text-base text-white/85 font-normal mb-6">
              Discover our latest collection of premium vegetables
            </p>

            {/* Price / Discount Info */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl sm:text-3xl font-black">25% OFF</span>
              <span className="text-xs sm:text-sm text-white/90">
                Use code: <strong className="font-bold">FRESH25</strong>
              </span>
            </div>
          </div>

          {/* Button */}
          <div className="relative z-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-[#FF5E13] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:gap-3 shadow-sm"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
