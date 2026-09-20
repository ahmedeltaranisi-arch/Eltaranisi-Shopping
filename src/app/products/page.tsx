import React from "react";
import Image from "next/image";
import Link from "next/link";
import { prodType } from "@/app/interface/products";
import { SubcategoryType } from "@/app/interface/categories";
import {
  Package,
  ShoppingCart,
  Star,
  Repeat,
  Eye,
  Filter,
  Folder,
  Layers,
  X,
} from "lucide-react";
import { notFound } from "next/navigation";
import AddBtn from "@/app/_components/AddBtn/AddBtn";
import { WishlistHeart } from "@/app/_components/WishlistControls/WishlistControls";
import {
  getProducts,
  getAllProducts,
  getCategories,
  getSubcategory,
  getCategory,
  getProductsByCategory,
  filterBySubcategory,
} from "@/app/services/categoriesService";
import { CategoryType } from "@/app/interface/categories";

type Props = {
  searchParams: Promise<{ subcategory?: string; category?: string }>;
};

/**
 * كارت المنتج — نفس تصميم كارت صفحة Products بالظبط (مستخدمة في الجزيين)
 */
function ProductCard({ product }: { product: prodType }) {
  const hasDiscount = !!product.priceAfterDiscount;
  /* 🆕 نسبة الخصم — نفس معادلة كارت صفحتك:
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
        {/* 🆕 بادج نسبة الخصم — أعلى اليسار (زي الصورة الأولى) */}
        {discountPct > 0 && (
          <span className="absolute top-0 left-0 z-20 bg-[#FF0000] text-white text-xs font-bold px-2.5 py-2 rounded-ee-2xl">
            -{discountPct}%
          </span>
        )}

        {/* Floating Icons */}
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

          {/* السعر + زر الإضافة */}
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
}

export default async function Products({ searchParams }: Props) {
  const { subcategory: subcategoryId, category: categoryId } =
    await searchParams;

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  // ---------- حالة filter على subcategory (جاية من /categories/[id]) ----------
  let subcategory: SubcategoryType | null = null;
  let category: CategoryType | null = null;
  let products: prodType[] = [];
  let errorMsg: string | null = null;

  if (subcategoryId) {
    try {
      // 1) نيجيب الـ subcategory + كل التصنيفات (عشان breadcrumb/الاسم)
      const [sub, categories] = await Promise.all([
        getSubcategory(subcategoryId),
        getCategories(),
      ]);
      subcategory = sub;
      if (!sub) subcategory = null;

      // 2) نيجيب كل المنتجات (كل الصفحات) ونفلترها على الـ subcategory
      //    (المنتج في API فيه صفة subcategory → الفلترة دقيقة بالـ id)
      const allProducts = await getAllProducts();
      products = filterBySubcategory(allProducts, subcategoryId);
    } catch (err: any) {
      errorMsg = err?.message ?? "An unexpected error occurred";
    }
  } else if (categoryId) {
    // ---------- حالة filter على category (زي Music/Books — ملهاش subcategories) ----------
    try {
      const [cat, byCat] = await Promise.all([
        getCategory(categoryId),
        getProductsByCategory(categoryId),
      ]);
      if (!cat) notFound(); // id غلط → 404
      category = cat;
      products = byCat;
    } catch (err: any) {
      if (err?.digest === "NEXT_NOT_FOUND") throw err;
      errorMsg = err?.message ?? "An unexpected error occurred";
    }
  } else {
    // ---------- الحالة العادية: All Products (زي الكود الأصلي) ----------
    try {
      products = await getProducts();
    } catch (err: any) {
      errorMsg = err?.message ?? "An unexpected error occurred";
    }
  }

  // اسم الفلتر النشط (subcategory أو category) + الأيقونة المناسبة
  const filterName = subcategory?.name ?? category?.name ?? null;
  const FilterIcon = subcategory ? Folder : Layers;

  // ---------- الـ filter state: /products?subcategory=<id> أو ?category=<id> ----------
  if (filterName) {
    return (
      <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
        {/* Header — جرادينت أخضر + بreadcrumb + أيقونة فولدر */}
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
                href="/categories"
                className="hover:text-white/70 transition-colors"
              >
                Categories
              </Link>
              <span className="text-white/60">/</span>
              <span className="font-bold">{filterName}</span>
            </nav>

            <div className="flex items-center gap-4">
              {/* بوكس الأيقونة: Folder للـ subcategory / Layers للتصنيف نفسه */}
              <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center shrink-0">
                <FilterIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                  {filterName}
                </h1>
                <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                  Browse {filterName} products
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

            {/* شيب الفلتر النشط (subcategory أو category) */}
            <span className="flex items-center gap-1.5 bg-[#E8F8EE] text-[#00B250] text-xs font-bold px-3 py-1.5 rounded-full">
              <FilterIcon className="w-3.5 h-3.5" />
              {filterName}
              <X className="w-3.5 h-3.5" />
            </span>

            {/* Clear all → بيشيل الـ filter وبيرجع لصفحة المنتجات */}
            <Link
              href="/products"
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

          {/* رسالة خطأ لو الـ API وقع */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {/* حالة مفيش منتجات (زي الصورة 7) */}
          {!errorMsg && products.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#F1F2F4] flex items-center justify-center">
                <Package className="w-9 h-9 text-[#B7B2A8]" />
              </div>
              <h3 className="text-lg font-bold text-[#14171A]">
                No Products Found
              </h3>
              <p className="mt-1.5 text-sm text-[#8A857B]">
                No products match your current filters.
              </p>
              <Link
                href="/products"
                className="inline-block mt-6 bg-[#00B250] hover:bg-[#009E47] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
              >
                View All Products
              </Link>
            </div>
          )}

          {/* حالة في منتجات (زي الصورة 8) — نفس كارت صفحة Products */}
          {!errorMsg && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- الحالة العادية: All Products ----------
  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* Header — زي ما هو */}
      <div
        className="bg-[#38C25B] text-white py-10 px-4 md:px-10 lg:px-20 relative overflow-hidden"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#A3EDC0] p-3 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#A3EDC0]">
                Home / All Products
              </span>
              <h1 className="mt-1 text-3xl md:text-5xl font-extrabold tracking-tight">
                All Products
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                Explore our complete product collection
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#A3EDC0] hidden sm:block">
            {products?.length ?? 0} items
          </span>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-10 py-8" data-aos="fade-up">
        <div className="border-b border-[#E7E5E1] pb-6 mb-8 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#8A857B]">
            Showing {products?.length ?? 0} products
          </span>
        </div>

        {/* رسالة خطأ بدل Error Page */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* حالة مفيش منتجات */}
        {!errorMsg && products.length === 0 && (
          <div className="text-center py-20 text-[#8A857B]">
            <Package className="w-14 h-14 mx-auto mb-4 text-[#B7B2A8]" />
            <p className="font-semibold">مفيش منتجات معروضة حاليا</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
