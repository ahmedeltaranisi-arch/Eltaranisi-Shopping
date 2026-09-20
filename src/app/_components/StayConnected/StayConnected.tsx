"use client";

import React from "react";
import {
  Mail,
  Leaf,
  Truck,
  Tag,
  ArrowRight,
  Sparkles,
  Smartphone,
  Star,
} from "lucide-react";

// مكون شعار أبل (App Store)
const AppleIcon = () => (
  <svg
    className="w-8 h-8 text-white fill-white"
    viewBox="0 0 384 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

// مكون شعار جوجل بلاي الملون (Google Play)
const GooglePlayIcon = () => (
  <svg
    className="w-7 h-7"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.52988 1.4646C2.39999 1.58988 2.32753 1.78013 2.32753 2.01955V21.98C2.32753 22.2194 2.39999 22.4097 2.52988 22.535L2.59567 22.5997L13.8471 11.3483V11.2312L2.59567 0.400391L2.52988 1.4646Z"
      fill="#39B0FF"
    />
    <path
      d="M17.5893 15.0886L13.8471 11.3464V11.2293L17.5893 7.48706L17.6852 7.54089L21.9806 9.9839C23.2033 10.6784 23.2033 11.8152 21.9806 12.5135L17.6852 14.9527L17.5893 15.0886Z"
      fill="#FFC300"
    />
    <path
      d="M17.6852 14.9526L13.8471 11.1145L2.59567 22.366C2.98978 22.7663 3.63665 22.819 4.41052 22.3831L17.6852 14.9526Z"
      fill="#E33B44"
    />
    <path
      d="M17.6852 7.54088L4.41052 0.110309C3.63665 -0.325595 2.98978 -0.272895 2.59567 0.127419L13.8471 11.3789L17.6852 7.54088Z"
      fill="#00C972"
    />
  </svg>
);

export default function StayConnected() {
  // التحديث هنا لاستخدام خط Exo
  const fontStyle = {
    fontFamily: "'Exo', sans-serif",
  };

  return (
    <section className="w-full py-10 px-4" style={fontStyle}>
      {/* الحاوية الرئيسية مع التدرج اللوني الفاتح جدًا */}
      <div className="max-w-7xl mx-auto rounded-[2rem] p-6 lg:p-12 bg-gradient-to-br from-[#F0FAF4] via-[#F8FCFA] to-[#FFF9F9] flex flex-col lg:flex-row items-center gap-10 lg:gap-16 shadow-sm border border-gray-50">
        {/* ================= LEFT SECTION: NEWSLETTER ================= */}
        <div
          data-aos="fade-right"
          className="flex-1 flex flex-col items-start w-full"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#07B570] rounded-xl flex items-center justify-center text-white shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#07B570] text-xs font-bold tracking-widest uppercase">
                Newsletter
              </span>
              <span className="text-gray-500 text-xs font-medium">
                50,000+ subscribers
              </span>
            </div>
          </div>

          {/* Titles */}
          <h2 className="text-3xl md:text-[2.75rem] leading-tight font-extrabold text-[#1A1F26] mb-4">
            Get the Freshest Updates <br className="hidden md:block" />
            <span className="text-[#07B570]">Delivered Free</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium mb-8">
            Weekly recipes, seasonal offers & exclusive member perks.
          </p>

          {/* Features Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700 text-xs font-semibold shadow-sm">
              <Leaf className="w-4 h-4 text-[#07B570]" />
              Fresh Picks Weekly
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700 text-xs font-semibold shadow-sm">
              <Truck className="w-4 h-4 text-[#07B570]" />
              Free Delivery Codes
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700 text-xs font-semibold shadow-sm">
              <Tag className="w-4 h-4 text-[#07B570]" />
              Members-Only Deals
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row w-full max-w-lg gap-3"
          >
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 px-5 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#07B570] text-gray-700 font-medium shadow-sm"
              required
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#07B570] hover:bg-[#069D61] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              Subscribe <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="flex items-center gap-1.5 mt-4 text-[#B8A372] text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-gray-400">
              Unsubscribe anytime. No spam, ever.
            </span>
          </div>
        </div>

        {/* ================= RIGHT SECTION: MOBILE APP CARD ================= */}
        <div
          data-aos="fade-left"
          className="w-full lg:w-[420px] bg-[#1A1F27] rounded-3xl p-8 relative overflow-hidden shadow-2xl flex-shrink-0"
        >
          {/* خلفية التوهج الأخضر داخل الكارت الأسود */}
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#07B570]/30 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#07B570] text-[10px] font-bold tracking-widest uppercase mb-6">
              <Smartphone className="w-3.5 h-3.5" />
              Mobile App
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-white text-2xl font-bold mb-2">
              Shop Faster on Our App
            </h3>
            <p className="text-gray-400 text-sm font-medium mb-8 line-clamp-2">
              Get app-exclusive deals & 15% off your first order.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col gap-3 mb-8">
              {/* Apple Store Button */}
              <button className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3.5 rounded-xl transition-colors text-left group">
                <AppleIcon />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wide">
                    Download on
                  </span>
                  <span className="text-white font-bold text-base leading-tight">
                    App Store
                  </span>
                </div>
              </button>

              {/* Google Play Button */}
              <button className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 border border-white/5 p-3.5 rounded-xl transition-colors text-left group">
                <GooglePlayIcon />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wide">
                    Get it on
                  </span>
                  <span className="text-white font-bold text-base leading-tight">
                    Google Play
                  </span>
                </div>
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]"
                  />
                ))}
              </div>
              <span className="text-gray-400 text-xs font-semibold">
                4.9 · 100K+ downloads
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
