import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Filter,
  Tag,
  X,
  Repeat,
  Eye,
  Star,
  ShoppingCart,
  Package,
} from "lucide-react";
import { prodType } from "@/app/interface/products";
import { brandType } from "@/services/types/brandType";
import AddBtn from "@/app/_components/AddBtn/AddBtn";
import { WishlistHeart } from "@/app/_components/WishlistControls/WishlistControls";

type propsType = {
  params: Promise<{ id: string }>;
};

// دالة جلب ماركة واحدة بالـ id (endpoint مخصوص للـ brand)
async function getBrand(id: string): Promise<brandType | null> {
  const response = await fetch(
    `https://ecommerce.routemisr.com/api/v1/brands/${id}`,
  );
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.data;
}

/*
  ⚠️ نفس تنبيه صفحة الماركات: الـ API بيقفل على 50 عنصر في الصفحة
  فبندور على كل الصفحات عشان نجيب كل المنتجات ونفلترها على الماركة
*/
async function getAllProducts(): Promise<prodType[]> {
  const allProducts: prodType[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/products?page=${page}&limit=50`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(
        `فشل تحميل المنتجات من السيرفر (status: ${response.status})`,
      );
    }
    const payload = await response.json();
    allProducts.push(...payload.data);

    hasMore = payload?.metadata?.nextPage != null && payload?.data?.length > 0;
    page = payload?.metadata?.nextPage ?? page + 1;
  }

  return allProducts;
}

export default async function BrandDetails({ params }: propsType) {
  const { id } = await params;
  const brand = await getBrand(id);

  // لو الـ id غلط مش هنلاقي ماركة → 404
  if (!brand) notFound();

  let products: prodType[] = [];
  try {
    const allProducts = await getAllProducts();
    products = allProducts.filter(
      (p) => p.brand?._id === id || p.brand?.name === brand.name,
    );
  } catch (err) {
    products = [];
  }

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  return (
    <div className="min-h-screen" style={fontStyle}>
      {/* Header — جراضيانت أخضر بنفس ستايل هيدر صفحة المنتجات */}
      <div
        className="bg-gradient-to-br from-[#009B4D] via-[#1FB85A] to-[#38C25B] text-white py-10 px-4 md:px-10 lg:px-20 relative overflow-hidden"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href="/brands"
              className="hover:text-white/70 transition-colors"
            >
              Brands
            </Link>
            <span className="text-white/60">/</span>
            <span>{brand.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* بوكس لوجو الماركة */}
            <div className="bg-white p-3 rounded-2xl flex items-center justify-center shrink-0">
              <Image
                src={brand.image}
                alt={brand.name}
                width={48}
                height={48}
                className="w-10 h-10 object-contain"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                {brand.name}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                Shop {brand.name} products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-12 py-8" data-aos="fade-up">
        {/* Active Filters */}
        <div className="border-b border-[#E7E5E1] pb-5 mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#14171A]">
            <Filter className="w-4 h-4 text-[#00B250]" />
            Active Filters:
          </div>

          {/* شيب الماركة النشطة */}
          <span className="flex items-center gap-1.5 bg-[#F3E8FF] text-[#7C3AED] text-xs font-bold px-3 py-1.5 rounded-full">
            <Tag className="w-3.5 h-3.5" />
            {brand.name}
            <X className="w-3.5 h-3.5" />
          </span>

          {/* Clear all → بيرجع صفحة الماركات */}
          <Link
            href="/brands"
            className="text-xs font-semibold text-[#14171A] underline underline-offset-4 hover:text-[#00B250] transition-colors"
          >
            Clear all
          </Link>
        </div>

        <div className="border-b border-[#E7E5E1] pb-5 mb-8 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#8A857B]">
            Showing {products.length} products
          </span>
        </div>

         {/* حالة مفيش منتجات — نفس تصميم الصورة بالظبط */}
        {products.length === 0 && (
          <div className="text-center py-24 bg-white">
            {/* الدائرة الرمادية اللي جواها أيقونة الصندوق */}
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F1F3F5] flex items-center justify-center">
              <Package className="w-7 h-7 text-[#9AA3AF]" />
            </div>

            <h2 className="text-xl font-bold text-[#1F2937]">
              No Products Found
            </h2>

            <p className="mt-2 text-[15px] text-[#6B7280]">
              No products match your current filters.
            </p>

            {/* الزرار الأخضر — بيرجع لكل المنتجات */}
            <Link
              href="/products"
              className="inline-block mt-8 px-5 py-2.5 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#1DA851] transition-colors"
            >
              View All Products
            </Link>
          </div>
        )}

        {/* Product Grid — نفس كارت صفحة المنتجات بالظبط */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => {
            // ⚠️ الـ API مبيجيبش فلد discount خالص — فبنحسب النسبة من السعرين
            // مثال: 20999 → 16799 = -20%
            const discountPercent = product.priceAfterDiscount
              ? Math.round(
                  ((product.price - product.priceAfterDiscount) /
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
                  {/* Badge الخصم — بيظهر بس لو فيه خصم حقيقي (أكتر من 0) */}
                  {discountPercent > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-[#EF4444] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      -{discountPercent}%
                    </span>
                  )}

                  {/* Floating Icons — القلب ديناميكي ❤️ */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <WishlistHeart prodId={product._id} />
                    <button
                      type="button"
                      className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Repeat className="w-4 h-4 text-[#8A857B]" />
                    </button>
                    <Link
                      href={productHref}
                      className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[#8A857B]" />
                    </Link>
                  </div>

                  {/* الصورة */}
                  <Link href={productHref} className="block">
                    <div className="relative w-full h-56 bg-[#F6F7F5]">
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

                  {/* البيانات — نفس كارت صفحة المنتجات (من غير description) */}
                  <div className="flex flex-col flex-1 px-4 pt-3 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A857B]">
                      {product.category?.name}
                    </span>

                    <Link href={productHref}>
                      <h2 className="mt-1 text-sm font-semibold text-[#14171A] line-clamp-2 hover:text-[#00B250] transition-colors">
                        {product.title}
                      </h2>
                    </Link>

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
                        ({product.ratingsCount ?? 0})
                      </span>
                    </div>

                    {/* السعر + زر الإضافة — نفس الزرار الدائري الأخضر بأيقونة السلة */}
                    <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-[#E7E5E1]">
                      <div className="flex items-baseline gap-2 min-w-0">
                        {product.priceAfterDiscount ? (
                          <>
                            <span className="text-lg font-extrabold text-[#00B250]">
                              {product.priceAfterDiscount} EGP
                            </span>
                            <span className="text-xs text-[#B7B2A8] line-through">
                              {product.price} EGP
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-extrabold text-[#14171A]">
                            {product.price} EGP
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
