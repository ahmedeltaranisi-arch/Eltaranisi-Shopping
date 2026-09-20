import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, FolderX, ArrowLeft, ArrowRight } from "lucide-react";
import {
  getCategory,
  getSubcategories,
} from "@/app/services/categoriesService";

type propsType = {
  params: Promise<{ id: string }>;
};

/**
 * صفحة تفاصيل التصنيف — قائمة الـ subcategories
 * (الـ subcategories جاية من API: /subcategories?category=<id>)
 * - hover على الكارت: الاسم بيكون أخضر + بيظهر "Browse Products →"
 * - اضغط → /products?subcategory=<id> (صفحة المنتجات مفلترة)
 */
export default async function CategoryDetails({ params }: propsType) {
  const { id } = await params;

  const category = await getCategory(id);
  // لو الـ id غلط مش هنلاقي تصنيف → 404
  if (!category) notFound();

  let subcategories: Awaited<ReturnType<typeof getSubcategories>> = [];
  let errorMsg: string | null = null;

  try {
    subcategories = await getSubcategories(id);
  } catch (err: any) {
    errorMsg = err?.message ?? "حدث خطأ غير متوقع";
  }

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* Header — نفس ستايل هيدر صفحات التصنيفات */}
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
            <span className="font-bold">{category.name}</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* بوكس صورة التصنيف */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/20 shrink-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                {category.name}
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                Choose a subcategory to browse products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-12 py-8" data-aos="fade-up">
        {/* Back to Categories */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8A857B] hover:text-[#00B250] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>

        {/* عدد الـ subcategories */}
        <h2 className="text-lg font-bold text-[#14171A] mb-6">
          {subcategories.length} Subcategories in {category.name}
        </h2>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* حالة مفيش subcategories — زي صورة 7 بالظبط (أيقونة في دايرة رمادية + زرار أخضر)
            الـ API ملوش subcategories لتصنيفات زي Music وBooks → بنعرض زرار يودينا على منتجات التصنيف مباشرة */}
        {!errorMsg && subcategories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#F1F2F4] flex items-center justify-center">
              <FolderX className="w-9 h-9 text-[#B7B2A8]" />
            </div>
            <h3 className="text-lg font-bold text-[#14171A]">
              No Subcategories Found
            </h3>
            <p className="mt-1.5 text-sm text-[#8A857B]">
              This category doesn&#39;t have subcategories yet.
            </p>
            <Link
              href={`/products?category=${category._id}`}
              className="inline-block mt-6 bg-[#00B250] hover:bg-[#009E47] text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Browse All {category.name} Products
            </Link>
          </div>
        )}

        {/* شبكة الـ subcategories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subcategories.map((sub) => (
            <Link
              key={sub._id}
              href={`/products?subcategory=${sub._id}`}
              className="group bg-white border border-[#E7E5E1] rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:border-[#38C25B] hover:shadow-lg hover:shadow-green-500/10"
              data-aos="fade-up"
            >
              {/* أيقونة الفولدر */}
              <div className="w-12 h-12 bg-[#E8F8EE] rounded-xl flex items-center justify-center shrink-0">
                <FolderOpen className="w-6 h-6 text-[#00B250]" />
              </div>

              {/* الاسم — بيحول أخضر مع الـ hover */}
              <h3 className="mt-6 text-lg font-bold text-[#14171A] transition-colors duration-300 group-hover:text-[#00B250]">
                {sub.name}
              </h3>

              {/* "Browse Products" — بيظهر بس عند الـ hover
                  (موجود دايمًا بـ opacity-0 عشان الارتفاع ما يتغيرش) */}
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#00B250] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Browse Products
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
