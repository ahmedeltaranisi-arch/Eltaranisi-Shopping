"use server";

import { getTokenFun } from "@/lib/server-token";
import { API_V1, API_V2, ApiError, serverFetch } from "@/lib/api";

export type ActionResult = {
  success: boolean;
  message: string;
  /** status الكود من الـ API (401 مثلاً) — عشان الكلاينت يعرف يفرّق بين "سجّل دخول" وأخطاء تانية */
  status?: number;
  data?: unknown;
};

/** POST /cart — بنجرب v1 الأول وبعده v2 عشان نتوافق مع أي نسخة */
export async function addToCart(prodId: string): Promise<ActionResult> {
  // تحقق من شكل الـ id قبل أي استدعاء (Server Actions endpoints عامة)
  if (typeof prodId !== "string" || !prodId.trim()) {
    return { success: false, message: "Invalid product id", status: 400 };
  }

  const token = await getTokenFun();
  if (!token) {
    return { success: false, message: "Please log in first", status: 401 };
  }

  try {
    const payload = await serverFetch<Record<string, unknown>>(`${API_V1}/cart`, {
      method: "POST",
      token,
      body: { productId: prodId },
    });
    return {
      success: true,
      message:
        (payload?.message as string) ??
        "Product added successfully to your cart",
      data: payload,
    };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
      try {
        const payload = await serverFetch<Record<string, unknown>>(`${API_V2}/cart`, {
          method: "POST",
          token,
          body: { productId: prodId },
        });
        return {
          success: true,
          message:
            (payload?.message as string) ??
            "Product added successfully to your cart",
          data: payload,
        };
      } catch (err2) {
        return toFailure(err2);
      }
    }
    return toFailure(err);
  }
}

function toFailure(err: unknown): ActionResult {
  if (err instanceof ApiError) {
    return { success: false, message: err.message, status: err.status };
  }
  return {
    success: false,
    message: "فشل الاتصال بالسيرفر — حاول مرة أخرى",
    status: 0,
  };
}
