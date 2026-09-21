"use server";

import { getTokenFun } from "@/lib/server-token";
import { API_V1, ApiError, serverFetch } from "@/lib/api";
import type { ActionResult } from "@/app/actions/cartActions/addToCart";

export async function removeFromWishlist(
  prodId: string,
): Promise<ActionResult> {
  if (typeof prodId !== "string" || !prodId.trim()) {
    return { success: false, message: "Invalid product id", status: 400 };
  }

  const token = await getTokenFun();
  if (!token) {
    return { success: false, message: "Please log in first", status: 401 };
  }

  try {
    const payload = await serverFetch<Record<string, unknown>>(
      `${API_V1}/wishlist/${prodId}`,
      { method: "DELETE", token },
    );
    return {
      success: true,
      message: (payload?.message as string) ?? "Removed from wishlist",
      data: payload,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, message: err.message, status: err.status };
    }
    return {
      success: false,
      message: "فشل الاتصال بالسيرفر — حاول مرة أخرى",
      status: 0,
    };
  }
}
