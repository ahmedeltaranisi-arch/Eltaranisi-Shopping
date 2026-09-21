import type { Metadata } from "next";
import { API_V1 } from "@/lib/api";
import { notFound } from "next/navigation";
import { prodType } from "@/types/products";
import ProductClientUI from "@/app/_components/ProductClientUI";

type propsType = {
  params: Promise<{ id: string }>;
};

// دالة جلب المنتج الأساسي
async function getProduct(id: string): Promise<prodType | null> {
  try {
    const response = await fetch(
      `${API_V1}/products/${id}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const payload = await response.json();
    return (payload?.data as prodType) ?? null;
  } catch {
    return null;
  }
}

// دالة جلب المنتجات لسكشن You May Also Like
async function getAllProducts(): Promise<prodType[]> {
  try {
    const response = await fetch(
      `${API_V1}/products`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload?.data as prodType[]) ?? [];
  } catch {
    return [];
  }
}

// SEO: العنوان والوصف من بيانات المنتج
export async function generateMetadata({
  params,
}: propsType): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.title,
    description: product.description?.slice(0, 160) || product.title,
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160) || product.title,
      images: product.imageCover ? [product.imageCover] : [],
    },
  };
}

export default async function ProductDetails({ params }: propsType) {
  const { id } = await params;
  const product = await getProduct(id);

  // المنتج مش موجود → صفحة 404 بدل ما الصفحة كلها تنهار
  if (!product) notFound();

  const allProducts = await getAllProducts();
  // اقتراحات: نفس الكتالوج من غير المنتج الحالي وبحد أقصى 8
  const relatedProducts = allProducts
    .filter((p) => p._id !== product._id)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-[#F9FAEB] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* استدعاء واجهة المستخدم التفاعلية وتمرير الداتا */}
        <ProductClientUI product={product} relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
