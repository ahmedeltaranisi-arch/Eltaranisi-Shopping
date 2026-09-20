import Image from "next/image";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { brandType } from '@/services/types/brandType';

/*
  ⚠️ مهم: الـ API بيقفل على 50 عنصر في الصفحة الواحدة (limit=50 هو الأقصى)
  فبندور على كل الصفحات حتى الـ metadata.nextPage يخلص — عشان نجيب الـ 54 ماركة كلها
*/
async function getAllBrands(): Promise<brandType[]> {
  const allBrands: brandType[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/brands?page=${page}&limit=50`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(
        `فشل تحميل الماركات من السيرفر (status: ${response.status})`,
      );
    }
    const payload = await response.json();
    allBrands.push(...payload.data);

    // لو مفيش nextPage معناها دي آخر صفحة
    hasMore = payload?.metadata?.nextPage != null && payload?.data?.length > 0;
    page = payload?.metadata?.nextPage ?? page + 1;
  }

  return allBrands;
}

export default async function Brands() {
  /* try/catch: لو الـ API وقع الصفحة متكسرش */
  let brands: brandType[] = [];
  let errorMsg: string | null = null;

  try {
    brands = await getAllBrands();
  } catch (err: any) {
    errorMsg = err?.message ?? "حدث خطأ غير متوقع";
  }

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* Header — نفس ستايل هيدر صفحة المنتجات لكن بجراديانت بنفسجي */}
      <div
        className="bg-gradient-to-br from-[#5B21B6] via-[#7C3AED] to-[#9F7AEA] text-white py-10 px-4 md:px-10 lg:px-20 relative overflow-hidden"
        data-aos="fade-up"
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-6">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span className="text-white/60">/</span>
            <span>Brands</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl flex items-center justify-center">
              <Tag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Top Brands
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#DDD6FE]">
                Shop from your favorite brands
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div className="max-w-7xl mx-auto px-10 py-10" data-aos="fade-up">
        {/* ① رسالة خطأ بدل Error Page */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        {/* ② حالة مفيش ماركات */}
        {!errorMsg && brands.length === 0 && (
          <div className="text-center py-20 text-[#8A857B]">
            <Tag className="w-14 h-14 mx-auto mb-4 text-[#B7B2A8]" />
            <p className="font-semibold">مفيش ماركات معروضة حالياُ</p>
          </div>
        )}

        {/* ③ Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {brands?.map((brand) => (
            <Link
              key={brand._id}
              href={`/brandDetails/${brand._id}`}
              className="group flex flex-col items-center bg-white border border-[#EFEDE9] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#C4B5FD]"
              data-aos="fade-up"
            >
              {/* Box اللوجو */}
              <div className="w-full aspect-square bg-[#F7F6F3] rounded-xl flex items-center justify-center p-6">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={160}
                  height={160}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>

              {/* اسم الماركة — بيتحول بنفسجي مع الـ hover */}
              <span className="mt-3 text-sm font-semibold text-[#14171A] group-hover:text-[#7C3AED] transition-colors duration-300">
                {brand.name}
              </span>

              {/* لينك View Products — بيظهر مع الـ hover
                  المساحة متحجوزة (opacity-0 بدل hidden) عشان الكارت ما يتهزش */}
              <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                View Products
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
