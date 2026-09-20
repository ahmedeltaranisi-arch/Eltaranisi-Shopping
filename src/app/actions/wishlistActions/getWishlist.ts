"use server";

import { getTokenFun } from "@/utilites/getTokenDate";

const BASE = "https://ecommerce.routemisr.com/api/v1";

export async function getWishlist() {
  const token = await getTokenFun();
  if (!token) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }

  try {
    const response = await fetch(`${BASE}/wishlist`, {
      method: "GET",
      headers: {
        token: token as string,
        "Content-type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const err: any = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    const payload = await response.json();

    /* 🔧 لو الـ API رجع الـ data كـ ids نصية بس (شكل v1 القديم)
       → نجيب تفاصيل المنتجات server-side عشان الصفحة تلاقيها جاهزة */
    const list = Array.isArray(payload?.data) ? payload.data : [];
    if (list.length > 0 && typeof list[0] === "string") {
      const details = await Promise.all(
        list.map((id: string) =>
          fetch(`${BASE}/products/${id}`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((j: any) => j?.data ?? null)
            .catch(() => null),
        ),
      );
      payload.data = details.filter(Boolean);
    }

    return payload;
  } catch (error: any) {
    if (error?.status === 401) throw error;
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}
