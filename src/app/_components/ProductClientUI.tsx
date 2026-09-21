"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { prodType } from "@/types/products";
import {
  ShoppingCart,
  Zap,
  Share2,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Repeat,
} from "lucide-react";

import AddBtn from "@/app/_components/AddBtn/AddBtn";
import {
  WishlistDetailsBtn,
  WishlistHeart,
} from "@/app/_components/WishlistControls/WishlistControls";

type Props = {
  product: prodType;
  relatedProducts: prodType[];
};

export default function ProductClientUI({ product, relatedProducts }: Props) {
  // --- States ---
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'reviews' | 'shipping'
  const [activeImage, setActiveImage] = useState(product.imageCover);

  // --- Image Handling ---
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.imageCover];

  // --- Slider Ref ---
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () =>
    sliderRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = () =>
    sliderRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  // --- Dynamic calculations ---
  const priceToUse = product.priceAfterDiscount || product.price;
  const totalPrice = (priceToUse * quantity).toFixed(2);

  /* 🆕 نسبة الخصم — نفس معادلة كروت products/CardOne بالظبط:
     round((السعر الأصلي - السعر بعد الخصم) / السعر الأصلي * 100)
     مثال: 6700 ← 6549 = 2.25% → تعرض "-2%" */
  const hasDiscount = !!product.priceAfterDiscount;
  const discountPct =
    hasDiscount && product.price > 0
      ? Math.round(
          ((product.price - (product.priceAfterDiscount ?? 0)) /
            product.price) *
            100,
        )
      : 0;

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', sans-serif",
  };

  // --- Dynamic Reviews & Progress Bars Generator ---
  const { fakeCount, reviewStats, displayRating } = useMemo(() => {
    const seedString = product._id || product.title || "default-product-seed";
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const positiveHash = Math.abs(hash);

    const count =
      product.ratingsCount && product.ratingsCount > 0
        ? product.ratingsCount
        : (positiveHash % 28) + 12;

    const rating =
      product.ratingsAverage && product.ratingsAverage > 0
        ? product.ratingsAverage
        : Number((3.9 + (positiveHash % 10) / 10).toFixed(1));

    const p5 = 35 + (positiveHash % 30);
    const p4 = 20 + ((positiveHash * 3) % 25);
    const p3 = 10 + ((positiveHash * 7) % 15);
    const p2 = 2 + ((positiveHash * 11) % 6);
    const p1 = Math.max(1, 100 - (p5 + p4 + p3 + p2));

    const stats = [
      { s: 5, p: p5 },
      { s: 4, p: p4 },
      { s: 3, p: p3 },
      { s: 2, p: p2 },
      { s: 1, p: p1 },
    ];

    return { fakeCount: count, reviewStats: stats, displayRating: rating };
  }, [
    product._id,
    product.title,
    product.ratingsCount,
    product.ratingsAverage,
  ]);

  return (
    <div style={fontStyle} className="text-[#14171A]">
      {/* Breadcrumb */}
      <nav
        data-aos="fade-up"
        className="flex items-center gap-2 text-xs font-semibold text-[#8A857B] mb-6"
      >
        <Link href="/" className="hover:text-[#14171A] transition-colors">
          Home
        </Link>
        <span>›</span>
        <Link
          href="/products"
          className="hover:text-[#14171A] transition-colors"
        >
          Women&apos;s Fashion
        </Link>
        <span>›</span>
        <span>Women&apos;s Clothing</span>
        <span>›</span>
        <span className="text-[#14171A]">{product.title}</span>
      </nav>

      {/* --- Top Section: Gallery & Info --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-8 rounded-2xl border border-[#E7E5E1] shadow-sm mb-10">
        {/* Left: Product Gallery */}
        <div
          className="lg:col-span-5 flex flex-col gap-4"
          data-aos="fade-right"
        >
          <div className="w-full h-[450px] relative bg-[#F6F7F5] rounded-xl overflow-hidden border border-[#E7E5E1] p-4 flex items-center justify-center">
            {/* 🆕 بادج نسبة الخصم — نفس ستايل زاوية كروت products (مدور من تحت-يمين) */}
            {discountPct > 0 && (
              <span className="absolute top-0 left-0 z-20 bg-[#FF0000] text-white text-xs font-bold px-2.5 py-2 rounded-ee-2xl">
                -{discountPct}%
              </span>
            )}
            <div
              key={activeImage}
              className="relative w-full h-full animate-in fade-in duration-500"
            >
              <Image
                src={activeImage}
                alt={product.title}
                fill
                className="object-contain"
               
              />
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`relative w-24 h-24 flex-shrink-0 bg-[#F6F7F5] overflow-hidden transition-all duration-300 ${
                  activeImage === img
                    ? "border-[3px] border-[#2B5B94]"
                    : "border border-[#E7E5E1] hover:border-gray-400"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumb ${idx}`}
                  fill
                  className="object-contain p-2"
                 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-7 flex flex-col" data-aos="fade-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#F6F7F5] text-[#8A857B] text-xs font-bold px-3 py-1 rounded-full">
              {product.category?.name || "Category"}
            </span>
            <span className="bg-[#F6F7F5] text-[#8A857B] text-xs font-bold px-3 py-1 rounded-full">
              {product.brand?.name || "Brand"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(displayRating) ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#E0E0E0] text-[#E0E0E0]"}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold">{displayRating}</span>
            <span className="text-sm text-[#8A857B]">
              ({fakeCount} reviews)
            </span>
          </div>

          {/* 🆕 السعر: بعد الخصم + الأصلي مشطوب + نسبة الخصم (زي الكروت) */}
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold">{priceToUse} EGP</span>
            {hasDiscount && (
              <span className="text-sm font-semibold text-[#B7B2A8] line-through">
                {product.price} EGP
              </span>
            )}
            {discountPct > 0 && (
              <span className="bg-[#FFEBEC] text-[#FF0000] text-xs font-bold px-2 py-0.5 rounded-md">
                -{discountPct}%
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#E8F8EE] text-[#00B250] text-xs font-bold px-3 py-1.5 rounded-full w-max mb-6">
            <div className="w-1.5 h-1.5 bg-[#00B250] rounded-full"></div> In
            Stock
          </div>

          <p className="text-sm text-[#666] mb-6 leading-relaxed line-clamp-2">
            {product.description}
          </p>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-xs text-[#8A857B] font-semibold mb-2">
              Quantity
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E7E5E1] rounded-lg overflow-hidden w-max">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-50 text-gray-600 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-[#8A857B]">
                {product.quantity || 220} available
              </span>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-[#F6F7F5] rounded-xl p-4 flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-[#8A857B]">
              Total Price:
            </span>
            <span className="text-xl font-extrabold text-[#00B250]">
              {totalPrice} EGP
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <AddBtn
              prodId={product._id}
              cls="flex-1 bg-[#00B250] hover:bg-[#009E47] cursor-pointer text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md"
              child={
                <>
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </>
              }
            />

            <button className="flex-1 bg-[#14171A] hover:bg-black text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md">
              <Zap className="w-5 h-5 fill-white" /> Buy Now
            </button>
          </div>

          {/* ❤️ زرار الـ Wishlist بقى ديناميكي — بيتحول لـ In Wishlist زي الصورة */}
          <div className="flex gap-3 mb-8">
            <div className="flex-1 cursor-pointer">
              <WishlistDetailsBtn prodId={product._id} />
            </div>
            <button className="bg-white border border-[#E7E5E1] hover:bg-gray-50 p-3 rounded-xl text-[#14171A] transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E7E5E1]">
            <div className="flex items-center gap-3">
              <div className="bg-[#E8F8EE] p-2 rounded-full text-[#00B250]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Free Delivery</p>
                <p className="text-[10px] text-[#8A857B]">Orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#E8F8EE] p-2 rounded-full text-[#00B250]">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">30 Days Return</p>
                <p className="text-[10px] text-[#8A857B]">Money back</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#E8F8EE] p-2 rounded-full text-[#00B250]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Secure Payment</p>
                <p className="text-[10px] text-[#8A857B]">100% Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Middle Section: Tabs (Details, Reviews, Shipping) --- */}
      <div
        className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm mb-16 overflow-hidden"
        data-aos="fade-up"
      >
        {/* Tabs Header */}
        <div className="flex border-b border-[#E7E5E1] overflow-x-auto">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "details" ? "text-[#00B250] border-b-2 border-[#00B250]" : "text-[#8A857B] hover:text-[#14171A]"}`}
          >
            <ShoppingBag className="w-4 h-4" /> Product Details
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "reviews" ? "text-[#00B250] border-b-2 border-[#00B250]" : "text-[#8A857B] hover:text-[#14171A]"}`}
          >
            <Star className="w-4 h-4" /> Reviews ({fakeCount})
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "shipping" ? "text-[#00B250] border-b-2 border-[#00B250]" : "text-[#8A857B] hover:text-[#14171A]"}`}
          >
            <Truck className="w-4 h-4" /> Shipping & Returns
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === "details" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-bold mb-4">About this Product</h3>
              <p className="text-sm text-[#666] mb-8">{product.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#F9FAEB] rounded-xl p-6 border border-[#E7E5E1]">
                  <h4 className="font-bold text-sm mb-4">
                    Product Information
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                      <span className="text-[#8A857B]">Category</span>
                      <span className="font-semibold">
                        {product.category?.name}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#8A857B]">Brand</span>
                      <span className="font-semibold">
                        {product.brand?.name}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#8A857B]">Items Sold</span>
                      <span className="font-semibold">
                        {product.sold || "100+"} sold
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#F9FAEB] rounded-xl p-6 border border-[#E7E5E1]">
                  <h4 className="font-bold text-sm mb-4">Key Features</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00B250]" /> Premium
                      Quality Product
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00B250]" /> 100%
                      Authentic Guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00B250]" /> Fast & Secure
                      Packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#00B250]" /> Quality
                      Tested
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="animate-in fade-in duration-300 w-full pt-2">
              <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-center md:items-start w-full border-b border-[#E7E5E1] pb-10 mb-8">
                <div className="flex flex-col items-center justify-center min-w-[150px] pt-2">
                  <span className="text-6xl font-extrabold text-[#14171A]">
                    {displayRating}
                  </span>
                  <div className="flex gap-1 mt-3 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= Math.round(displayRating) ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#E0E0E0] text-[#E0E0E0]"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#8A857B]">
                    Based on {fakeCount} reviews
                  </span>
                </div>

                <div className="flex-1 w-full flex flex-col justify-center space-y-3">
                  {reviewStats.map((item) => (
                    <div
                      key={item.s}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className="w-10 text-xs font-medium text-[#8A857B] text-left leading-tight">
                        <div>{item.s}</div>
                        <div className="text-[10px] text-[#A09D96]">star</div>
                      </div>
                      <div className="flex-1 h-2.5 bg-[#E7E5E1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFC107] rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${item.p}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-[#8A857B]">
                        {item.p}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center pb-4">
                <Star className="w-10 h-10 fill-[#E7E5E1] text-[#E7E5E1] mb-3" />
                <p className="text-[#8A857B] text-sm mb-4">
                  Customer reviews will be displayed here.
                </p>
                <button className="text-[#00B250] font-bold text-sm hover:underline">
                  Write a Review
                </button>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="animate-in fade-in duration-300 grid md:grid-cols-2 gap-6">
              <div className="bg-[#E8F8EE] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#00B250] p-2 rounded-full text-white">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#14171A]">
                    Shipping Information
                  </h4>
                </div>
                <ul className="space-y-3 text-sm text-[#14171A]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Free shipping
                    on orders over $50
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Standard
                    delivery: 3-5 business days
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Express
                    delivery available (1-2 days)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Track your
                    order in real-time
                  </li>
                </ul>
              </div>
              <div className="bg-[#E8F8EE] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-[#00B250] p-2 rounded-full text-white">
                    <RefreshCcw className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#14171A]">
                    Returns & Refunds
                  </h4>
                </div>
                <ul className="space-y-3 text-sm text-[#14171A]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> 30-day
                    hassle-free returns
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Full refund or
                    exchange available
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Free return
                    shipping on defective items
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00B250]" /> Easy online
                    return process
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Section: You May Also Like (Carousel) --- */}
      <div data-aos="fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#00B250] rounded-full inline-block"></span>
            You May Also <span className="text-[#00B250]">Like</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="bg-white border border-[#E7E5E1] p-2 rounded-full hover:bg-gray-50 transition shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="bg-white border border-[#E7E5E1] p-2 rounded-full hover:bg-gray-50 transition shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {relatedProducts?.map((item) => {
            const itemHref = `/productDetails/${item._id}`;

            /* 🆕 نفس حساب نسبة الخصم بتاع كروت products/CardOne — لكل منتج في الكاروسيل */
            const itemHasDiscount = !!item.priceAfterDiscount;
            const itemDiscountPct =
              itemHasDiscount && item.price > 0
                ? Math.round(
                    ((item.price - (item.priceAfterDiscount ?? 0)) /
                      item.price) *
                      100,
                  )
                : 0;

            return (
              <div
                key={item._id}
                className="snap-start flex-shrink-0 w-[260px] flex flex-col bg-white border border-[#E7E5E1] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 relative group"
              >
                {/* 🆕 بادج نسبة الخصم — أعلى يسار الكارت، نفس ستايل كروت products */}
                {itemDiscountPct > 0 && (
                  <span className="absolute top-0 left-0 z-20 bg-[#FF0000] text-white text-xs font-bold px-2.5 py-2 rounded-ee-2xl">
                    -{itemDiscountPct}%
                  </span>
                )}

                {/* Floating Icons — القلب بقى ديناميكي ❤️ */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <WishlistHeart
                    prodId={item._id}
                    className="cursor-pointer bg-white p-2 rounded-full shadow-md transition hover:scale-110"
                  />
                  <button className="bg-white p-2 rounded-full shadow-md hover:text-[#00B250] transition">
                    <Repeat className="w-4 h-4" />
                  </button>
                  <Link
                    href={itemHref}
                    className="bg-white p-2 rounded-full shadow-md hover:text-[#00B250] transition"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>

                {/* Image */}
                <Link
                  href={itemHref}
                  className="relative w-full h-52 bg-[#F6F7F5] p-4 flex items-center justify-center"
                >
                  <Image
                    src={item.imageCover}
                    alt={item.title}
                    fill
                    className="object-contain mix-blend-multiply p-4"
                   
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                  <span className="text-[10px] font-bold uppercase text-[#8A857B] mb-1">
                    {item.category?.name}
                  </span>
                  <Link href={itemHref}>
                    <h3 className="text-sm font-semibold text-[#14171A] line-clamp-1 mb-1 hover:text-[#00B250] transition-colors">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= (item.ratingsAverage ?? 0) ? "fill-[#FFC107] text-[#FFC107]" : "fill-[#E0E0E0] text-[#E0E0E0]"}`}
                      />
                    ))}
                    <span className="text-xs text-[#8A857B] ml-1">
                      ({item.ratingsCount || 0})
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#E7E5E1]">
                    {/* 🆕 السعر: بعد الخصم + الأصلي مشطوب (زي كروت products) */}
                    <div className="flex flex-wrap items-baseline gap-1.5 min-w-0">
                      <span className="text-lg font-extrabold">
                        {item.priceAfterDiscount || item.price} EGP
                      </span>
                      {itemHasDiscount && (
                        <span className="text-xs font-semibold text-[#B7B2A8] line-through">
                          {item.price} EGP
                        </span>
                      )}
                    </div>
                    {/* 🐞 تصحيح باج: كان بيضيف المنتج الرئيسي بدل المنتج بتاع الكارت */}
                    <AddBtn
                      prodId={item._id}
                      cls="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-r from-[#00B250] to-[#38C25B] text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0"
                      child={<ShoppingCart className="w-5 h-5" />}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
