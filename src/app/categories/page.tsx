import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, ArrowRight } from "lucide-react";
import { getCategories } from "@/services/categories";

/**
 * صفحة All Categories
 * - hover على الكارت: الكارت بيطلع لفوق، الصورة بتكبر (scale) جوه الإطار من غير ما تخرجه
 *  ، واسم التصنيف بيبقى أخضر وبيظهر "View Subcategories →"
 * - اضغط أي كارت → صفحة تفاصيل التصنيف (قائمة الـ subcategories)
 */
export default async function CategoriesPage() {
  const data = await getCategories();

  if (data.length === 0) {
    notFound();
  }

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* Header — نفس ستايل هيدرات الموقع */}
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
            <span className="font-bold">Categories</span>
          </nav>

          <div className="flex items-center gap-4">
            {/* بوكس الأيقونة */}
            <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center shrink-0">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                All Categories
              </h1>
              <p className="mt-1.5 text-sm font-semibold text-[#A3EDC0]">
                Browse our wide range of product categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* شبكة التصنيفات */}
      <div className="max-w-7xl mx-auto px-11 py-10" data-aos="fade-up">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {data.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category._id}`}
              className="group bg-white border border-[#E7E5E1] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 hover:border-[#38C25B] hover:shadow-xl hover:shadow-green-500/10"
              data-aos="fade-left"
            >
              {/* الصورة — overflow-hidden عشان الـ scale ما يطلعش من الإطار */}
              <div className="relative w-full h-52 rounded-xl overflow-hidden bg-[#F6F7F5]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                 
                />
              </div>

              {/* الاسم — بيحول أخضر مع الـ hover */}
              <h3 className="mt-4 text-center text-base font-bold text-[#14171A] transition-colors duration-300 group-hover:text-[#00B250]">
                {category.name}
              </h3>

              {/* "View Subcategories" — بيظهر بس عند الـ hover
                  (موجود دايمًا بـ opacity-0 عشان ما يحصلش أي shift في الـ layout) */}
              <span className="mt-1.5 flex items-center justify-center gap-1 text-sm font-semibold text-[#00B250] opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                View Subcategories
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
