/**
 * استدعاء الـ API الخارجي من المتصفح — عن طريق البروكسي الآمن `/api/ext/*`
 * (التوكن بيتضاف على السيرفر جوه البروكسي — مش بيتحفظ في localStorage ولا بيوصل للبراوزر).
 *
 * pathمثال: "v1/cart" أو "v2/cart/64ab..."
 */

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/ext/${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* صفحة HTML (خطأ غير متوقع) */
  }

  if (!res.ok) {
    const parsed = body as { message?: string; errors?: { msg?: string }[] } | null;
    const message =
      parsed?.message ??
      parsed?.errors?.[0]?.msg ??
      `Request failed (${res.status})`;
    throw new HttpError(message, res.status);
  }

  return body as T;
}

/** جرّب أكتر من مسار بالترتيب (v1 ثم v2 مثلاً) وارجع بأول نجاح */
export async function apiFetchWithFallback<T = unknown>(
  attempts: { path: string; options?: RequestInit }[],
): Promise<T> {
  let lastError: unknown = null;
  for (const attempt of attempts) {
    try {
      return await apiFetch<T>(attempt.path, attempt.options ?? {});
    } catch (err) {
      // 404/405 = المسار ده مش موجود → جرّب اللي بعده. أي خطأ تاني يترمي على طول
      if (err instanceof HttpError && (err.status === 404 || err.status === 405)) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new HttpError("فشل الطلب", 500);
}
