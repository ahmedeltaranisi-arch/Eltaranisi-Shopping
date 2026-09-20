"use client";

import { useEffect } from "react";
// import Swiper core and required modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

// AOS Import
import AOS from "aos";
import "aos/dist/aos.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Slide({
  spaceBetween,
  slidesPerView,
  pageList,
}: {
  spaceBetween: number;
  slidesPerView: number;
  pageList: string[];
}) {
  // تهيئة AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true, // اجعلها true إذا أردت أن تعمل الحركة مرة واحدة فقط عند التمرير
    });
  }, []);

  // دالة لجلب محتوى كل شريحة بناءً على الترتيب (Index)
  const getSlideContent = (index: number) => {
    switch (index) {
      case 1:
        return {
          title: "Premium Quality Guaranteed",
          desc: "Fresh from Farm to Your Table",
        };
      case 2:
        return {
          title: "Fast & Free Delivery",
          desc: "Same day delivery available",
        };
      case 0:
      default:
        return {
          title: "Fresh Products Delivered to your Door",
          desc: "Get 20% off your first order",
        };
    }
  };

  return (
    <section className="w-full flex flex-col gap-8 overflow-hidden">
      {/* ================= SLIDER SECTION ================= */}
      <div className="w-full h-[400px] md:h-[500px] relative">
        <Swiper
          loop={true}
          modules={[Navigation, Pagination]}
          spaceBetween={spaceBetween}
          slidesPerView={slidesPerView}
          navigation
          pagination={{
            clickable: true,
            bulletActiveClass: "!w-10 !h-3 !rounded-xl !opacity-100",
            renderBullet: (index, className) => {
              return `<span class="${className} !bg-[#FFFFFF] w-3 h-3 transition-all duration-300"></span>`;
            },
          }}
          className="w-full h-full"
        >
          {pageList.map((src, index) => {
            const content = getSlideContent(index);

            return (
              <SwiperSlide key={index} className="w-full h-full relative">
                <Image
                  src={src}
                  alt={`Slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                />

                {/* طبقة لونية خضراء داكنة لضمان وضوح النص */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A63E]/80 via-[#00A63E]/40 to-transparent"></div>

                {/* محتوى السلايدر */}
                <div className="absolute inset-0 flex items-center z-10">
                  <div className="px-10 md:px-24 text-white max-w-2xl">
                    <h2
                      data-aos="fade-right"
                      className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-wide"
                    >
                      {content.title}
                    </h2>
                    <p
                      data-aos="fade-right"
                      data-aos-delay="100"
                      className="text-lg md:text-xl mb-8 font-light"
                    >
                      {content.desc}
                    </p>

                    <div
                      data-aos="fade-up"
                      data-aos-delay="200"
                      className="flex flex-wrap items-center gap-4"
                    >
                      <Link
                        href="/products"
                        className="bg-white text-[#00A63E] font-bold px-6 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        Shop Now
                      </Link>
                      <Link
                        href="/brands"
                        className="bg-transparent border border-white text-white font-bold px-6 py-3 rounded-md hover:bg-white/10 transition-colors"
                      >
                        View Brands
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* ================= FEATURES SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 w-full pb-8 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            data-aos="fade-up"
            data-aos-delay="0"
            className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Free Shipping
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                On orders over 500 EGP
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Secure Payment
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                100% secure transactions
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                Easy Returns
              </h4>
              <p className="text-xs text-gray-500 mt-1">14-day return policy</p>
            </div>
          </div>

          {/* Card 4 */}
          <div
            data-aos="fade-up"
            data-aos-delay="300"
            className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm md:text-base">
                24/7 Support
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                Dedicated support team
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
