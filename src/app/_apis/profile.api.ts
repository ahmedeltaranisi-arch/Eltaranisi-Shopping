import { jwtDecode } from "jwt-decode";

const BASE = "https://ecommerce.routemisr.com/api/v1";

// أي نص شكله JWT (3 أجزاء مفصولة بنقطة)
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

// توكن ممرّر يدويًا من AuthBridge (بياخده من next-auth session)
let explicitToken: string | null = null;

// بيدور جوه أي object/array على أول قيمة شكلها JWT
function findTokenDeep(value: unknown, depth = 0): string | null {
  if (depth > 4 || value == null) return null;
  if (typeof value === "string" && JWT_RE.test(value)) return value;
  if (typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      const found = findTokenDeep(v, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1) توكن متمرر يدويًا (NextAuth / setAuthToken)
  if (explicitToken) return explicitToken;

  try {
    const stores: Array<Storage> = [];
    if (window.localStorage) stores.push(window.localStorage);
    if (window.sessionStorage) stores.push(window.sessionStorage);

    for (const store of stores) {
      // 2) الشكل المتوقع: userData (JSON فيه user + token)
      const raw = store.getItem("userData");
      if (raw) {
        if (JWT_RE.test(raw)) return raw; // متخزن كنص مش JSON
        const parsed: unknown = JSON.parse(raw);
        const found = findTokenDeep(parsed);
        if (found) return found;
      }

      // 3) مفاتيح شائعة
      for (const key of ["token", "userToken", "jwt"]) {
        const v = store.getItem(key);
        if (v && v !== "undefined" && v !== "null") {
          return v.replace(/^"|"$/g, ""); // لو اتخزنت بـ JSON.stringify
        }
      }

      // 4) دوّر على أي JWT في أي مفتاح
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (!key || key === "userData") continue;
        const v = store.getItem(key);
        if (!v) continue;
        if (JWT_RE.test(v)) {
          console.warn(`[profile.api] Token found in key "${key}"`);
          return v;
        }
        if (v.startsWith("{") || v.startsWith("[")) {
          try {
            const found = findTokenDeep(JSON.parse(v));
            if (found) {
              console.warn(`[profile.api] Token found inside key "${key}"`);
              return found;
            }
          } catch {
            /* مش JSON — تجاهل */
          }
        }
      }
    }

    // 5) كوكيز غير httpOnly (js-cookie وغيره)
    const parts = document.cookie ? document.cookie.split(";") : [];
    for (const part of parts) {
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const name = part.slice(0, eq).trim();
      let value = part.slice(eq + 1).trim();
      try {
        value = decodeURIComponent(value);
      } catch {
        /* قيمة مش encoded */
      }
      if (JWT_RE.test(value)) {
        console.warn(`[profile.api] Token found in cookie "${name}"`);
        return value;
      }
      if (value.startsWith("{") || value.startsWith("[")) {
        try {
          const found = findTokenDeep(JSON.parse(value));
          if (found) {
            console.warn(`[profile.api] Token found inside cookie "${name}"`);
            return found;
          }
        } catch {
          /* مش JSON — تجاهل */
        }
      }
    }

    // 6) مفيش توكن — اطبع ملخص تشخيصي (أسماء بس، من غير قيم)
    const keysOf = (s: Storage) =>
      Array.from({ length: s.length }, (_, i) => s.key(i)).filter(Boolean);
    const cookieNames = parts
      .map((p) => p.split("=")[0]?.trim())
      .filter(Boolean);
    console.warn(
      `[profile.api] No token found — ` +
        `localStorage: [${keysOf(window.localStorage).join(", ")}] | ` +
        `sessionStorage: [${keysOf(window.sessionStorage).join(", ")}] | ` +
        `cookies: [${cookieNames.join(", ")}]`
    );
    console.warn(
      "[profile.api] لو بتستخدم NextAuth: مرّر التوكن من الـ session بـ setAuthToken() — أو ابعتلي كود اللوجين اللي بيخزن بيها التوكن"
    );
  } catch {
    /* ignore */
  }
  return null;
}

// بيتنادى من AuthBridge كل ما الـ session تتغيّر — بيثبّت التوكن في الموديول وبيخزّنه كمان
export function setAuthToken(token: string | null): void {
  explicitToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem("token", token);
    } else {
      window.localStorage.removeItem("token");
    }
  } catch {
    /* ignore */
  }
}

// alias — بعض الصفحات (زي settings) بتنادي setStoredToken بعد تغيير الباسورد
export function setStoredToken(token: string): void {
  setAuthToken(token);
}

export interface StoredUser {
  name?: string;
  email?: string;
  phone?: string;
  _id?: string;
  id?: string;
}

// بيقرا بيانات اليوزر المخزنة محليًا (اتحطت بواسطة setStoredUser)
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

// ⚠️ الـ API الأصلي (RouteMisr) مفهوش endpoint شبكة اسمه verifyToken بيرجع بيانات اليوزر —
// التحقق بيتم محليًا بفك تشفير التوكن نفسه (زي ما هو مستخدم بالظبط في next-auth/authOption.ts بمكتبة jwt-decode)
export async function verifyToken(): Promise<{ decoded: Record<string, unknown> }> {
  const token = getToken();
  if (!token) throw new Error("لا يوجد توكن مسجّل دخول");
  try {
    const decoded = jwtDecode<Record<string, unknown>>(token);
    return { decoded };
  } catch {
    throw new Error("التوكن غير صالح");
  }
}

async function readResponse(response: Response) {
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
    throw new Error(message);
  }
  return body as Record<string, unknown>;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { token } : {}),
  };
}

// PUT /users/updateMe
export async function updateMyData(body: {
  name: string;
  email: string;
  phone?: string;
}) {
  const response = await fetch(`${BASE}/users/updateMe/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

// PUT /users/changeMyPassword — بيرجع توكن جديد
export async function changeMyPassword(body: {
  currentPassword: string;
  password: string;
  rePassword: string;
}): Promise<{ token?: string } & Record<string, unknown>> {
  const response = await fetch(`${BASE}/users/changeMyPassword`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readResponse(response) as Promise<{ token?: string }>;
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
  const response = await fetch(`${BASE}/addresses`, {
    headers: authHeaders(),
  });
  const payload = await readResponse(response);
  return (payload?.data as AddressType[]) ?? [];
}

// POST /addresses
export async function addAddress(
  body: Omit<AddressType, "_id">
): Promise<Record<string, unknown>> {
  const response = await fetch(`${BASE}/addresses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

// PUT /addresses/:addressId
// ⚠️ ملحوظة: الـ API الرسمي لـ RouteMisr موثّق فيه GET / POST / DELETE للعناوين بس —
// مفيش PUT موثّق لتعديل عنوان موجود. لو السيرفر رجّع 404/405 هنا، يبقى لازم نعمل
// Delete + Add بدل التعديل المباشر، أو نتأكد من الـ endpoint الصح من التوثيق الرسمي.
export async function updateAddress(
  addressId: string,
  body: Omit<AddressType, "_id">
): Promise<Record<string, unknown>> {
  const response = await fetch(`${BASE}/addresses/${addressId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

// DELETE /addresses/:addressId
export async function deleteAddress(
  addressId: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`${BASE}/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return readResponse(response);
}
