/**
 * طبقة الـ API الخاصة بالبروفايل — كل الاستدعاءات بتم عن طريق
 * البروكسي الآمن `/api/ext/*` (التوكن بيتحط على السيرفر — مش بيتحفظ في المتصفح).
 */

/** بيانات المستخدم المخزنة محلياً (بدون أي أسرار/توكنات) — للتعبئة السريعة للفورمات */
export interface StoredUser {
  name?: string;
  email?: string;
  phone?: string;
  _id?: string;
  id?: string;
}

export function getStoredUser<T = StoredUser>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return (parsed?.user ?? parsed) as T;
  } catch {
    return null;
  }
}

// بيدمج البيانات الجديدة مع المخزنة فعلاً (عشان متمسحش حاجة مش متبعتة)
export function setStoredUser(data: Partial<StoredUser>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUser<StoredUser>() ?? {};
    const merged = { ...current, ...data };
    window.localStorage.setItem("userData", JSON.stringify({ user: merged }));
  } catch {
    /* ignore */
  }
}

export type DecodedUser = {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

/**
 * بيجيب بيانات الحساب الحقيقية من GET /users/getMe عن طريق البروكسي.
 * (سابقاً كان بيفك التوكن محلياً — دلوقتي بيرجع بيانات موثوقة من السيرفر نفسه)
 */
export async function verifyToken(): Promise<{ decoded: DecodedUser }> {
  type MeResponse = {
    data?: Record<string, unknown>;
    user?: Record<string, unknown>;
  };
  const payload = await apiGet<MeResponse>("v1/users/getMe");
  const data = (payload?.data ?? payload?.user ?? {}) as Record<string, unknown>;

  const id = String(data._id ?? data.id ?? "");
  if (!id) throw new Error("Could not read your account data");

  return {
    decoded: {
      id,
      _id: id,
      name: asStr(data.name),
      email: asStr(data.email),
      phone: asStr(data.phone),
      role: asStr(data.role) || "user",
    },
  };
}

// PUT /users/updateMe
export async function updateMyData(body: {
  name: string;
  email: string;
  phone?: string;
}): Promise<Record<string, unknown>> {
  return apiSend("v1/users/updateMe/", "PUT", body);
}

// PUT /users/changeMyPassword — بيرجع توكن جديد (الجلسة الحالية بتفضل شغالة)
export async function changeMyPassword(body: {
  currentPassword: string;
  password: string;
  rePassword: string;
}): Promise<{ token?: string } & Record<string, unknown>> {
  return apiSend("v1/users/changeMyPassword", "PUT", body) as Promise<{
    token?: string;
  } & Record<string, unknown>>;
}

export interface AddressType {
  _id: string;
  name: string;
  details: string;
  phone: string;
  city: string;
}

// GET /addresses
export async function getUserAddresses(): Promise<AddressType[]> {
  const payload = await apiGet<{ data?: AddressType[] }>("v1/addresses");
  return payload?.data ?? [];
}

// POST /addresses
export async function addAddress(
  body: Omit<AddressType, "_id">,
): Promise<Record<string, unknown>> {
  return apiSend("v1/addresses", "POST", body);
}

// PUT /addresses/:addressId
// ⚠️ ملحوظة: الـ API الرسمي لـ RouteMisr موثّق فيه GET / POST / DELETE للعناوين بس —
// لو السيرفر رجّع 404/405 هنا يبقى لازم Delete + Add بدل التعديل المباشر.
export async function updateAddress(
  addressId: string,
  body: Omit<AddressType, "_id">,
): Promise<Record<string, unknown>> {
  return apiSend(`v1/addresses/${addressId}`, "PUT", body);
}

// DELETE /addresses/:addressId
export async function deleteAddress(
  addressId: string,
): Promise<Record<string, unknown>> {
  return apiSend(`v1/addresses/${addressId}`, "DELETE");
}

/* ------------------------------ helpers ------------------------------ */

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/ext/${path}`);
  return readResponse<T>(res);
}

async function apiSend<T = Record<string, unknown>>(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(`/api/ext/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return readResponse<T>(res);
}

async function readResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`السيرفر رجّع رد غير JSON (status: ${response.status})`);
  }
  if (!response.ok) {
    const message =
      (body as { message?: string } | null)?.message ??
      `فشل الطلب (status: ${response.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
  return body as T;
}

function asStr(value: unknown): string {
  return typeof value === "string" ? value : "";
}
