import { CategoryType, SubcategoryType } from "@/app/interface/categories";
import { prodType } from "@/app/interface/products";

const BASE = "https://ecommerce.routemisr.com/api/v1";

/** جلب كل التصنيفات الرئيسية */
export async function getCategories(): Promise<CategoryType[]> {
  const response = await fetch(`${BASE}/categories`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`فشل تحميل التصنيفات (status: ${response.status})`);
  }
  const payload = await response.json();
  return payload?.data ?? [];
}

/** جلب تصنيف واحد بالـ id */
export async function getCategory(id: string): Promise<CategoryType | null> {
  const response = await fetch(`${BASE}/categories/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.data ?? null;
}

/** جلب كل الـ subcategories الموجودة تحت تصنيف معين (مع pagination) */
export async function getSubcategories(
  categoryId: string,
): Promise<SubcategoryType[]> {
  const all: SubcategoryType[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${BASE}/subcategories?category=${categoryId}&page=${page}&limit=40`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(
        `فشل تحميل الـ subcategories (status: ${response.status})`,
      );
    }
    const payload = await response.json();
    all.push(...(payload?.data ?? []));
    hasMore =
      payload?.metadata?.nextPage != null && (payload?.data?.length ?? 0) > 0;
    page = payload?.metadata?.nextPage ?? page + 1;
  }

  return all;
}

/** جلب subcategory واحدة بالـ id */
export async function getSubcategory(
  id: string,
): Promise<SubcategoryType | null> {
  const response = await fetch(`${BASE}/subcategories/${id}`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload?.data ?? null;
}

/**
 * جلب كل منتجات تصنيف معين مباشرة (بدون subcategories)
 * الـ API بيسند `?category=<id>` server-side → أسرع من تنزيل كل المنتجات
 * (مفيد لتصنيفات زي Music/Books اللي ملهاش subcategories في الـ API)
 */
export async function getProductsByCategory(
  categoryId: string,
): Promise<prodType[]> {
  const all: prodType[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${BASE}/products?category=${categoryId}&page=${page}&limit=50`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      throw new Error(`فشل تحميل منتجات التصنيف (status: ${response.status})`);
    }
    const payload = await response.json();
    all.push(...(payload?.data ?? []));
    hasMore =
      payload?.metadata?.nextPage != null && (payload?.data?.length ?? 0) > 0;
    page = payload?.metadata?.nextPage ?? page + 1;
  }

  return all;
}

/** جلب أول صفحة منتجات (لصفحة All Products — زي الكود الأصلي) */
export async function getProducts(): Promise<prodType[]> {
  const response = await fetch(`${BASE}/products`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(
      `فشل تحميل المنتجات من السيرفر (status: ${response.status})`,
    );
  }
  const payload = await response.json();
  return payload?.data ?? [];
}

/*
  ⚠️ الـ API بيقفل على 50 عنصر في الصفحة
  فبندور على كل الصفحات عشان نجيب كل المنتجات ونفلترها على الـ subcategory
*/
export async function getAllProducts(): Promise<prodType[]> {
  const allProducts: prodType[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${BASE}/products?page=${page}&limit=50`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      throw new Error(
        `فشل تحميل المنتجات من السيرفر (status: ${response.status})`,
      );
    }
    const payload = await response.json();
    allProducts.push(...(payload?.data ?? []));
    hasMore =
      payload?.metadata?.nextPage != null && (payload?.data?.length ?? 0) > 0;
    page = payload?.metadata?.nextPage ?? page + 1;
  }

  return allProducts;
}

/** فلترة كل المنتجات على subcategory معينة (المنتج فيه صفة subcategory) */
export function filterBySubcategory(
  products: prodType[],
  subcategoryId: string,
): prodType[] {
  return products.filter((p) =>
    p.subcategory?.some((s) => s._id === subcategoryId),
  );
}
