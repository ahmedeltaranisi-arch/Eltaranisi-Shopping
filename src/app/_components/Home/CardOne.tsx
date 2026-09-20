import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prodType } from "@/app/interface/products";
import { Repeat, Eye, Star, ShoppingCart } from "lucide-react";
import AddBtn from "@/app/_components/AddBtn/AddBtn";
import { WishlistHeart } from "@/app/_components/WishlistControls/WishlistControls";

export default async function CardOne() {
  async function getProducts(): Promise<prodType[] | null> {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/products`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error("Server response failed");
    }

    const payload = await response.json();
    return payload.data;
  }

  const products = await getProducts();

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header: All Products + Showing Products Count */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E5E1] pb-6 mb-8"
          data-aos="fade-up"
        >
          {/* جهة اليسار: العنوان */}
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-[#008A5E] rounded-full inline-block shrink-0" />
            <h2 className="text-2xl font-bold text-black">
              All <span className="text-[#008A5E]">Products</span>
            </h2>
          </div>

          {/* جهة اليمين: عدد المنتجات */}
          <span className="text-sm font-semibold text-[#8A857B]">
            Showing {products?.length ?? 0} products
          </span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => {
            const hasDiscount = !!product.priceAfterDiscount;
            /* نسبة الخصم — نفس معادلة كارت صفحة products:
               round((السعر الأصلي - السعر بعد الخصم) / السعر الأصلي * 100)
               مثال: 6700 ← 6549 = 2.25% → تعرض "-2%" */
            const discountPct =
              hasDiscount && product.price > 0
                ? Math.round(
                    ((product.price - (product.priceAfterDiscount ?? 0)) /
                      product.price) *
                      100,
                  )
                : 0;
            const ratingStars = Math.floor(product.ratingsAverage ?? 0);
            const productHref = `/productDetails/${product._id}`;

            return (
              <div
                key={product._id}
                className="flex flex-col bg-white border border-[#E7E5E1] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
                data-aos="fade-left"
              >
                <div className="hover:transition-transform duration-300 hover:-translate-y-1.5">
                  {/* 🆕 بادج نسبة الخصم — مطابق لكارت products بالظبط */}
                  {discountPct > 0 && (
                    <span className="absolute top-0 left-0 z-20 bg-[#FF0000] text-white text-xs font-bold px-2.5 py-2 rounded-ee-2xl">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Floating Icons — القلب بقى ديناميكي ❤️ */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 ">
                    <WishlistHeart
                      prodId={product._id}
                     
                    />

                    <button
                      type="button"
                      className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Repeat className="w-4 h-4 text-[#8A857B]" />
                    </button>

                    <Link
                      href={productHref}
                      className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#8A857B]" />
                    </Link>
                  </div>

                  {/* الصورة */}
                  <Link href={productHref} className="block">
                    <div className="relative w-full h-64 bg-[#F6F7F5]">
                      <Image
                        src={product.imageCover}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-6"
                        unoptimized
                      />
                    </div>
                  </Link>

                  {/* البيانات */}
                  <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A857B]">
                      {product.category?.name}
                    </span>

                    <Link href={productHref}>
                      <h2 className="mt-1 text-sm font-semibold text-[#14171A] line-clamp-1 hover:text-[#00B250] transition-colors">
                        {product.title}
                      </h2>
                    </Link>

                    {/* Rating */}
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-[#14171A]">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= ratingStars
                                ? "fill-[#FFD700] text-[#FFD700]"
                                : "fill-[#B7B2A8] text-[#B7B2A8]"
                            }`}
                          />
                        ))}
                      </div>
                      <span>{product.ratingsAverage}</span>
                      <span className="text-[#8A857B]">
                        ({product.ratingsCount ?? product.ratingsQuantity ?? 0})
                      </span>
                    </div>

                    <Link href={productHref}>
                      <p className="mt-2 text-xs text-[#8A857B] line-clamp-2 leading-relaxed hover:text-[#14171A] transition-colors">
                        {product.description}
                      </p>
                    </Link>

                    {/* السعر + زر AddBtn — سعر بعد الخصم + الأصلي مشطوب */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-[#E7E5E1]">
                      <div className="flex items-baseline gap-2 min-w-0">
                        {hasDiscount ? (
                          <>
                            <span className="text-xl font-bold text-[#14171A]">
                              ${product.priceAfterDiscount} EGP
                            </span>
                            <span className="text-xs text-[#B7B2A8] line-through">
                              ${product.price} EGP
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-[#14171A]">
                            ${product.price} EGP
                          </span>
                        )}
                      </div>

                      <AddBtn
                        prodId={product._id}
                        cls="cursor-pointer w-10 h-10 rounded-full bg-gradient-to-r from-[#00B250] to-[#38C25B] text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0"
                        child={<ShoppingCart className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
