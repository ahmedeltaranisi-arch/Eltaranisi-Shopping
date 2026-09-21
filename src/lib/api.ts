/**
 * إعدادات الـ API الخارجي (RouteMisr) — للاستدعاءات اللي بتم من السيرفر بس
 * (Server Actions / Route Handlers). التوكن بيتضاف هنا ومش بيوصل للبراوزر.
 */

export const API_ORIGIN =
  process.env.API_ORIGIN ?? "https://ecommerce.routemisr.com";

export const API_V1 = `${API_ORIGIN}/api/v1`;
export const API_V2 = `${API_ORIGIN}/api/v2`;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ServerFetchInit = {
  method?: string;
  /** توكن المستخدم — بيتحط في هيدر `token` زي ما الـ API متوقع */
  token?: string | null;
  body?: unknown;
  /** لو عايز تكاش (للبيانات العامة زي المنتجات والتصنيفات) */
  revalidate?: number;
};

/** استدعاء الـ API الخارجي من السيرفر مع قراءة آمنة للـ response */
export async function serverFetch<T = Record<string, unknown>>(
  url: string,
  { method = "GET", token = null, body, revalidate }: ServerFetchInit = {},
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { token } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(revalidate
      ? { next: { revalidate } }
      : { cache: "no-store" as const }),
  });

  const text = await res.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(`السيرفر رجّع رد غير JSON (status: ${res.status})`, res.status);
  }

  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      `فشل الطلب (status: ${res.status})`;
    throw new ApiError(message, res.status);
  }

  return payload as T;
}
