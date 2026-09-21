"use server";

import { getTokenFun } from "@/lib/server-token";
import { API_V1, serverFetch } from "@/lib/api";

const BASE = API_V1;

type WishlistPayload = {
  status?: string;
  count?: number;
  data?: unknown[];
  message?: string;
};

const EMPTY: WishlistPayload = { status: "empty", count: 0, data: [] };

export async function getWishlist(): Promise<WishlistPayload> {
  const token = await getTokenFun();
  // من غير توكن → نرجّع ليستة فاضية بدل ما نرمي error (الـ query محتاج data دايماً)
  if (!token) return { ...EMPTY, status: "unauthorized" };

  try {
    const payload = await serverFetch<WishlistPayload>(`${BASE}/wishlist`, {
      token,
    });

    /* 🔧 لو الـ API رجع الـ data كـ ids نصية بس (شكل v1 القديم)
       → نجيب تفاصيل المنتجات server-side عشان الصفحة تلاقيها جاهزة */
    const list = Array.isArray(payload?.data) ? payload.data : [];
    if (list.length > 0 && typeof list[0] === "string") {
      const details = await Promise.all(
        (list as string[]).map((id) =>
          serverFetch<Record<string, unknown>>(`${BASE}/products/${id}`, {
            revalidate: 60,
          })
            .then((j) => (j?.data as Record<string, unknown>) ?? null)
            .catch(() => null),
        ),
      );
      payload.data = details.filter(Boolean);
      payload.count = payload.data.length;
    }

    return payload;
  } catch {
    return { ...EMPTY, status: "error" };
  }
}
