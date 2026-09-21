"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Home,
  ArrowLeft,
  Apple,
  Carrot,
  Leaf,
  Citrus,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter(); // لتمكين وظيفة العودة للخلف

  // مسارات الوجهات الشائعة (يمكنك تعديل الـ href حسب المسارات الحقيقية في مشروعك)
  const popularDestinations = [
    { name: "Categories", path: "/categories" },
    { name: "Today's Deals", path: "/deals" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      {/* 
        إضافة CSS مخصص لحركة العناصر العائمة (Infinite Floating)
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float-down {
          0%, 100% { transform: translateY(-10px); }
          50% { transform: translateY(15px); }
        }
        .animate-float {
          animation: float-down 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-down 5s ease-in-out infinite 2s;
        }
        .animate-float-slow {
          animation: float-down 6s ease-in-out infinite 1s;
        }
      `,
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-[#f5fcf8] to-white relative overflow-hidden flex flex-col items-center justify-center font-sans text-slate-800">
        {/* العناصر العائمة (الفواكه والخضروات) بحركة من أعلى لأسفل باستمرار */}
        <div className="absolute top-[15%] left-[10%] text-green-200/60 animate-float">
          <Apple size={50} fill="currentColor" />
        </div>
        <div className="absolute top-[20%] right-[15%] text-green-200/60 animate-float-delayed">
          <Carrot size={45} fill="currentColor" className="rotate-45" />
        </div>

        {/* استخدام Citrus بعد تحديث المكتبة */}
        <div className="absolute bottom-[25%] left-[15%] text-green-200/60 animate-float-slow">
          <Citrus size={45} fill="currentColor" className="-rotate-12" />
        </div>

        <div className="absolute bottom-[20%] right-[10%] text-green-200/60 animate-float">
          <Leaf size={40} fill="currentColor" className="-rotate-45" />
        </div>

        {/* الجزء العلوي: الأيقونة الأساسية ورقم 404 */}
        <div className="relative mt-12 mb-8 z-10 flex flex-col items-center">
          <div className="relative">
            {/* بطاقة سلة المشتريات */}
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(16,185,129,0.15)] w-48 h-36 flex items-center justify-center z-10 relative">
              <ShoppingCart
                className="text-[#15b768] w-20 h-20"
                strokeWidth={2.5}
              />
            </div>

            {/* شارة 404 */}
            <div className="absolute -top-4 -right-4 bg-[#15b768] text-white font-black text-xl tracking-wider w-16 h-16 rounded-full flex items-center justify-center border-[5px] border-[#f5fcf8] z-20 shadow-lg">
              404
            </div>
          </div>

          {/* النقاط والابتسامة أسفل البطاقة */}
          <div className="flex justify-center items-center gap-3 mt-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15b768]"></span>
            <svg
              width="30"
              height="15"
              viewBox="0 0 24 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2C2 2 6 10 12 10C18 10 22 2 22 2"
                stroke="#15b768"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="w-2.5 h-2.5 rounded-full bg-[#15b768]"></span>
          </div>
        </div>

        {/* النصوص */}
        <div className="text-center max-w-2xl mx-auto z-10 relative px-4 mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a202c] mb-4 tracking-tight">
            Oops! Nothing Here
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-10 font-medium">
            Looks like this page went out of stock! Don&apos;t worry,
            <br className="hidden md:block" />
            there&apos;s plenty more fresh content to explore.
          </p>

          {/* الأزرار (Go to Homepage / Go Back) */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-14">
            {/* تم تحويله إلى Link للذهاب للرئيسية */}
            <Link
              href="/"
              className="group flex items-center gap-2 bg-[#15b768] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(21,183,104,0.5)] transition-all duration-300 transform hover:-translate-y-1.5 hover:bg-[#109a56] hover:shadow-[0_12px_25px_-6px_rgba(21,183,104,0.6)]"
            >
              <Home size={22} />
              Go to Homepage
            </Link>

            {/* زر العودة للخلف باستخدام router.back() */}
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-bold text-lg shadow-sm border border-slate-200 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-[0_12px_25px_-6px_rgba(0,0,0,0.1)]"
            >
              <ArrowLeft
                size={22}
                className="transition-transform duration-300 group-hover:-translate-x-2"
              />
              Go Back
            </button>
          </div>

          {/* قسم الوجهات الشائعة (Popular Destinations) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-3xl mx-auto">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Popular Destinations
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* تحويل الزر النشط (Active) لـ Link */}
              <Link
                href="/products"
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#e8f8f0] text-[#15b768] transition-colors duration-200"
              >
                All Products
              </Link>

              {/* باقي الأزرار مع تحويلها لـ Links وتمرير المسارات الخاصة بها */}
              {popularDestinations.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-slate-50 text-slate-600 transition-all duration-300 hover:bg-[#e8f8f0] hover:text-[#15b768]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
