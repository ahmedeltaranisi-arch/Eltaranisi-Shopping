import Link from "next/link";
import { prodType } from "@/app/interface/products";
import ProductClientUI from './../../components/ProductClientUI';

type propsType = {
  params: Promise<{ id: string }>;
};

// دالة جلب المنتج الأساسي
async function getProduct(id: string): Promise<prodType> {
  const response = await fetch(
    `https://ecommerce.routemisr.com/api/v1/products/${id}`,
  );
  const payload = await response.json();
  return payload.data;
}

// دالة جلب كل المنتجات لسكشن You May Also Like
async function getAllProducts(): Promise<prodType[]> {
  const response = await fetch(
    `https://ecommerce.routemisr.com/api/v1/products`,
    { next: { revalidate: 3600 } },
  );
  const payload = await response.json();
  return payload.data;
}

export default async function ProductDetails({ params }: propsType) {
  const { id } = await params;
  const product = await getProduct(id);
  const allProducts = await getAllProducts();

  return (
    <div className="min-h-screen bg-[#F9FAEB] font-sans pb-20">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* استدعاء واجهة المستخدم التفاعلية وتمرير الداتا */}
        <ProductClientUI product={product} relatedProducts={allProducts} />
      </div>
    </div>
  );
}
