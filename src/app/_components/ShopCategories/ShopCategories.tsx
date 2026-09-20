import Image from "next/image";
import Link from "next/link";

/**
 * قسم Shop By Category في صفحة Home — نسخة مستقلة (مفيهاش أي imports خارجية)
 *
 * ⭐ الطلب: الضغط على أي كارت تصنيف ينقلك على /categories/<id> (صفحة CategoryDetails)
 * - الكارت كله <Link> واحد → أي ضغطة (صورة/اسم/فايضه) بتنقل
 * - الأيد بيتقري من `_id` أو `id` أياً كان شكل الداتا عندك
 * - الـ UI زي ما هو بالظبط: 6 أعمدة متجاوبين، صورة دايريه،
 *   هوفر: border أخضر + الاسم أخضر + رفعة خفيفة + cursor pointer
 */

type CategoryType = {
  _id?: string;
  id?: string;
  name: string;
  image: string;
  [key: string]: any;
};

async function getCategories(): Promise<CategoryType[] | null> {
  const response = await fetch(
    "https://ecommerce.routemisr.com/api/v1/categories",
    { next: { revalidate: 3600 } },
  );
  if (!response.ok) return null;
  const payload = await response.json();
  // لو الداتا عندك متعشفة جوه data.category (شكل قديم) ننزل لها
  const raw = payload?.data?.category ?? payload?.data ?? [];
  return Array.isArray(raw) ? raw : null;
}

export default async function ShopCategories() {
  const data = await getCategories().catch(() => null);

  if (!data) {
    return (
      <div className="p-4 text-center text-red-500 font-semibold">
        فشل في تحميل التصنيفات
      </div>
    );
  }

  return (
    <section className="my-10 container mx-auto px-4">
      {/* عنوان القسم والشريط الجانبي */}
      <div className="flex items-center gap-3 my-6" data-aos="fade-up">
        <span className="w-1.5 h-6 bg-[#008A5E] rounded-full inline-block shrink-0" />
        <h2 className="text-2xl font-bold text-black">
          Shop By{" "}
          <span className="text-2xl font-bold text-[#008A5E]">Category</span>
        </h2>
      </div>

      {/* الشبكة المتجاوبة: 2→3→4→6 أعمدة */}
      <div className="my-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {data.map((category) => {
          // 🆕 الأيد بأمان من الشكلين — من غير كده اللينك بيطلع /categories/undefined
          const cid: string = category._id ?? category.id ?? "";
          if (!cid) return null; // كارت من غير لينك = بلاش

          // 🆕 الكارت كله <Link> واحد → الضغطة في أي حتة تنقلك للـ CategoryDetails
          return (
            <Link
              key={cid}
              href={`/categories/${cid}`}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#008A5E] hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              data-aos="fade-left"
            >
              {/* الصورة الدائرية */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-gray-50 group-hover:scale-105 transition-transform duration-200">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* اسم التصنيف */}
              <span className="text-sm font-semibold text-gray-800 text-center line-clamp-1 group-hover:text-[#008A5E] transition-colors">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
