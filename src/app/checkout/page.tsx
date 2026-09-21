"use client";

/**
 * صفحة Checkout — نسخة طبق الأصل من التصميم
 *
 * البيانات كلها ديناميكية:
 *  - المستخدم (الاسم + العناوين المحفوظة): GET /users/getMe (ومن fallback endpoint مخصص للعناوين)
 *  - الكارت (العناصر + قيمة الـ cartId): GET /api/v1/cart (fallback /api/v2/cart)
 *
 * الـ flows:
 *  - Cash on Delivery → POST /api/v1/orders/{cartId} بـ { shippingAddress }
 *    → تمسح الكارت (DELETE /api/v1/cart) → redirect /orders
 *  - Pay Online → POST /api/v1/orders/checkout-session/{cartId}?url=...
 *    → redirect للمندفع على session.url اللي بيرجعه الـ API
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CreditCard,
  Home,
  Info,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { apiFetch, HttpError } from "@/lib/api-client";

const API_V1 = "/api/ext/v1";
const API_V2 = "/api/ext/v2";

/* ---------------------------------- Types ---------------------------------- */

type AddressType = {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  city: string;
  details?: string;
  address?: string;
  street?: string;
};

type CartItemType = {
  id: string;
  title: string;
  image: string;
  unitPrice: number;
  count: number;
};

type PaymentMode = "cash" | "online";

type FieldErrors = { city?: string; street?: string; phone?: string };

/* --------------------------------- Helpers --------------------------------- */

/** شكل الـ response اللي بيرجعه الـ API (مرن — الحقول المهمة معرّفة) */
type ApiBody = {
  data?: unknown;
  user?: unknown;
  message?: string;
  errors?: { msg?: string }[];
  session?: { url?: string };
};

type RawProduct = {
  id?: string;
  _id?: string;
  title?: string;
  imageCover?: string;
  images?: (string | { url?: string })[];
  price?: number;
  priceAfterDiscount?: number;
};

type RawCartItem = {
  product?: RawProduct;
  count?: number;
  quantity?: number;
  price?: number;
  _id?: string;
};

/*
  كل النداءات بتم عن طريق البروكسي الآمن /api/ext — التوكن بيتحط على السيرفر
  ومش محتاجين نبعته من المتصفح (ولا نخزنه في localStorage).
*/
async function fetchJson(url: string, options: RequestInit = {}): Promise<ApiBody> {
  try {
    // "/api/ext/v1/..." ← بنبعت المسار من غير prefix بتاع البروكسي
    return await apiFetch<ApiBody>(url.replace(/^\/api\/ext\//, ""), options);
  } catch (err) {
    // 401 = التوكن منتهي أو مرفوض → بنستخدمها في شاشة "سجّل الدخول تاني"
    if (err instanceof HttpError && err.status === 401) {
      err.name = "UnauthorizedError";
    }
    throw err;
  }
}

/* ----------------------------- Fetch the user ----------------------------- */

async function fetchUser(): Promise<Record<string, unknown> | null> {
  const payload = await fetchJson(`${API_V1}/users/getMe`);
  return ((payload?.data ?? payload?.user ?? null) as Record<string, unknown> | null);
}

/*
  العناوين المحفوظة:
  1) لو الـ user object جاي فيه مصفوفة addresses → نستخدمها مباشرة
  2) وإلا نجيبها من الـ endpoint المخصص: GET /api/v1/addresses
*/
async function fetchAddresses(
  user: Record<string, unknown> | null,
): Promise<AddressType[]> {
  if (Array.isArray(user?.addresses) && user.addresses.length > 0) {
    return user.addresses as AddressType[];
  }
  if (user?.address && !Array.isArray(user.address)) {
    return [user.address as AddressType];
  }
  try {
    const payload = await fetchJson(`${API_V1}/addresses`);
    const list = payload?.data ?? [];
    return Array.isArray(list) ? (list as AddressType[]) : [];
  } catch {
    return [];
  }
}

/* ------------------------------- Fetch the cart ---------------------------- */

/*
  الكارت: بنجرب v1 الأول (نفس رزمة الـ app) وبعده v2
  والـ normalize بيتعامل مع الاتنين مع بعض (item.count / item.quantity, product.id / product._id)
*/
function normalizeCart(cart: Record<string, unknown>) {
  // ⚠️ في الـ API ده:
  //   v1 cart → العناصر تحت key "products"
  //   v2 cart → العناصر تحت key "items"
  // فبنقري الاتنين عشان أي نسخة ترجع نجيبها صح
  const rawItems: RawCartItem[] = Array.isArray(cart?.products)
    ? (cart.products as RawCartItem[])
    : Array.isArray(cart?.items)
      ? (cart.items as RawCartItem[])
      : [];
  const items: CartItemType[] = rawItems
    .map((item) => {
      const p: RawProduct = item?.product ?? (item as RawProduct) ?? {};
      return {
        id: String(p?.id ?? p?._id ?? item?._id ?? ""),
        title: p?.title ?? "Product",
        image:
          p?.imageCover ??
          (typeof p?.images?.[0] === "string"
            ? p.images[0]
            : p?.images?.[0]?.url ?? ""),
        unitPrice: Number(p?.priceAfterDiscount || p?.price || item?.price || 0),
        count: Number(item?.count ?? item?.quantity ?? 1) || 1,
      };
    })
    .filter((it) => it.id !== "");

  return { cartId: String(cart?.id ?? cart?._id ?? ""), items };
}

async function fetchCart(): Promise<{ cartId: string; items: CartItemType[] }> {
  let lastError: unknown = null;
  let firstGood: { cartId: string; items: CartItemType[] } | null = null;
  for (const base of [API_V1, API_V2]) {
    try {
      const payload = await fetchJson(`${base}/cart`);
      const cart = (payload?.data ?? payload) as Record<string, unknown>;
      const normalized = normalizeCart(cart);
      // أول رد ناجح بنحفظه (حتى لو فاضي → "Your cart is empty")
      if (!firstGood) firstGood = normalized;
      // وبنرجّع فور ما نلاقي عناصر فعلية
      if (normalized.items.length > 0) return normalized;
    } catch (err) {
      lastError = err;
    }
  }
  if (firstGood) return firstGood; // الكارت فعلاً فاضي
  console.error("[checkout] cart failed on v1 and v2:", lastError);
  throw lastError instanceof Error
    ? lastError
    : new Error("Could not load your cart. Please try again.");
}

/* ------------------------------ Address helpers ---------------------------- */

function addressKey(a: AddressType): string {
  return String(a._id ?? a.id ?? `${a.name}-${a.phone}`);
}

function addressDetails(a: AddressType): string {
  return a.details ?? a.address ?? a.street ?? "";
}

/* ================================= Component ================================ */

export default function CheckoutPage() {
  const router = useRouter();

  /* ------------------------------ Data state ------------------------------ */
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authIssue, setAuthIssue] = useState<null | "missing" | "expired">(null);
  const [userName, setUserName] = useState("");
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [cartId, setCartId] = useState("");
  const [items, setItems] = useState<CartItemType[]>([]);

  /* ------------------------------ Form state ------------------------------ */
  const [selectedAddressKey, setSelectedAddressKey] = useState<string>("new");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [payment, setPayment] = useState<PaymentMode>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /*
    🔑 الجلسة هي مصدر الحقيقة الوحيد — التوكن بيتحط على السيرفر عن طريق
    البروكسي الآمن ومش بيتحفظ في المتصفح.
  */
  const { status } = useSession();

  const useNewAddress = selectedAddressKey === "new";

  /* -------------------------------- Loading -------------------------------- */
  useEffect(() => {
    // بنستنى next-auth يخلص تحميل الـ session
    if (status === "loading") return;

    let cancelled = false;

    async function load() {
      // لو مفيش جلسة → شاشة "سجّل الدخول الأول" بزرار للوجين
      if (status === "unauthenticated") {
        setAuthIssue("missing");
        setLoading(false);
        return;
      }
      try {
        const [user, cart] = await Promise.all([fetchUser(), fetchCart()]);
        const savedAddresses = await fetchAddresses(user);
        if (cancelled) return;
        setUserName(String(user?.name ?? ""));
        setAddresses(savedAddresses);
        setCartId(cart.cartId);
        setItems(cart.items);
      } catch (err) {
        if (cancelled) return;
        console.error("[checkout] load failed:", err);
        // لو الجلسة منتهية/مرفوضة (401) → شاشة "سجّل الدخول تاني"
        if (err instanceof Error && err.name === "UnauthorizedError") {
          setAuthIssue("expired");
          return;
        }
        setLoadError(
          err instanceof Error ? err.message : "Something went wrong while loading.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  /* -------------------------------- Totals --------------------------------- */
  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.count, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.unitPrice * it.count, 0),
    [items],
  );

  const formatMoney = (value: number) => value.toLocaleString("en-US");

  /* --------------------------- Address selection --------------------------- */
  /* عنوان محفوظ: بنعمل pre-fill للفورم ببياناته (ولسه قابل للتعديل) */
  function selectSavedAddress(a: AddressType) {
    setCity(a.city ?? "");
    setStreet(addressDetails(a));
    setPhone(a.phone ?? "");
    setFieldErrors({});
    setSubmitError(null);
    setSelectedAddressKey(addressKey(a));
  }

  /* "Use a different address": فورم فاضي بالكامل */
  function selectManualAddress() {
    setCity("");
    setStreet("");
    setPhone("");
    setFieldErrors({});
    setSubmitError(null);
    setSelectedAddressKey("new");
  }

  /* ------------------------------- Validation ------------------------------ */
  function validateForm(): boolean {
    const errors: FieldErrors = {};
    if (!city.trim()) errors.city = "City is required";
    if (!street.trim()) errors.street = "Street address is required";
    if (!/^01[0-9]{9}$/.test(phone.trim()))
      errors.phone = "Enter a valid Egyptian number (01xxxxxxxxx)";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* --------------------------- Build shipping address ---------------------- */
  function buildShippingAddress() {
    if (!useNewAddress) {
      const a = addresses.find((ad) => addressKey(ad) === selectedAddressKey);
      // العنوان المختار مش موجود (نداء قديم مثلاً) → نستخدم المكتوب في الفورم
      if (!a) {
        return {
          name: userName,
          phone: phone.trim(),
          city: city.trim(),
          details: street.trim(),
          address: street.trim(),
        };
      }
      const details = addressDetails(a);
      return {
        name: a.name ?? "",
        phone: a.phone ?? "",
        city: a.city ?? "",
        details,
        address: details, // نبعث الاتنين عشان الـ API بيتقبل الشكلين
      };
    }
    return {
      name: userName,
      phone: phone.trim(),
      city: city.trim(),
      details: street.trim(),
      address: street.trim(),
    };
  }

  /* --------------------------------- Submit -------------------------------- */
  async function handleSubmit() {
    setSubmitError(null);
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (payment === "cash") {
        /*
          Create Cash Order — v1
          لو معاك v2 تخدم عليك، بدّل الـ url لـ:
          `${API_V2}/orders/${cartId}` مع نفس الـ body
        */
        await fetchJson(
          `${API_V1}/orders/${cartId}`,
          {
            method: "POST",
            body: JSON.stringify({ shippingAddress: buildShippingAddress() }),
          },
        );

        // نمسح الكارت — لو فشل مبيوقفش الـ redirect
        try {
          await fetchJson(`${API_V1}/cart`, { method: "DELETE" });
        } catch {
          /* ignore */
        }

        // عدّل المسار ده لو صفحة الأوردرات عندك في تاني مكان
        router.push("/orders");
      } else {
        // Pay Online — بنجيب الـ session وبنحول المندفع لبوابة الدفع
        const payload = await fetchJson(
          `${API_V1}/orders/checkout-session/${cartId}?url=${encodeURIComponent(
            window.location.origin,
          )}`,
          { method: "POST" },
        );
        const sessionUrl =
          payload?.session?.url ??
          (payload?.data as { session?: { url?: string } } | undefined)?.session
            ?.url;
        if (!sessionUrl) {
          throw new Error("Payment session was not found in the response.");
        }
        window.location.href = sessionUrl;
        return; // redirect → مبنستناش
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fontStyle = {
    fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
  };

  /* ------------------------------- Loading UI ------------------------------ */
  if (loading) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center"
        style={fontStyle}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00A550] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">
            Preparing your order...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------- Not logged in UI --------------------------- */
  if (authIssue) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-4"
        style={fontStyle}
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {authIssue === "missing" ? "Please log in first" : "Your session has expired"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {authIssue === "missing"
              ? "You need to be logged in to complete your order."
              : "Please log in again to continue with checkout."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {/* نفس مسار اللوجين اللي في صفحة الكارت (/Login) */}
            <Link
              href="/Login"
              className="px-5 py-2.5 rounded-lg bg-[#00A550] text-white text-sm font-semibold hover:bg-[#008A43] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/cart"
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- Error UI -------------------------------- */
  if (loadError) {
    return (
      <div
        className="min-h-screen bg-white flex items-center justify-center px-4"
        style={fontStyle}
      >
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-bold text-gray-900">
            We couldn&apos;t load your order
          </h2>
          <p className="mt-2 text-sm text-gray-500">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#00A550] text-white text-sm font-semibold hover:bg-[#008A43] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------- Empty cart UI ----------------------------- */
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white" style={fontStyle}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <Breadcrumb />
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F1F3F5] flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-[#9AA3AF]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-[15px] text-gray-500">
              Add some products before checking out.
            </p>
            <Link
              href="/products"
              className="inline-block mt-7 px-5 py-2.5 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#1DA851] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================================== Page ================================== */
  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <style>{`
        .checkout-summary-scroll::-webkit-scrollbar { width: 6px; }
        .checkout-summary-scroll::-webkit-scrollbar-track { background: transparent; }
        .checkout-summary-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 9999px; }
        .checkout-summary-scroll { scrollbar-width: thin; scrollbar-color: #D1D5DB transparent; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumb />

        {/* ------------------------------ Header ------------------------------ */}
        <div className="mt-5 mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#009B4D] to-[#38C25B] flex items-center justify-center shadow-lg shadow-green-600/20 shrink-0">
              <ReceiptText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Complete Your Order
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-500">
                Review your items and complete your purchase
              </p>
            </div>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-bold text-[#00A550] hover:text-[#008A43] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>

        {/* ------------------------------ Layout ------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
          {/* ============================ LEFT COLUMN =========================== */}
          <div className="space-y-6">
            {/* ------------------------- Shipping card ------------------------ */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Green header */}
              <div className="bg-gradient-to-r from-[#009448] via-[#12A24F] to-[#25AE5B] text-white px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <Home className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Shipping Address</h2>
                </div>
                <p className="mt-0.5 text-sm text-white/85">
                  Where should we deliver your order?
                </p>
              </div>

              <div className="p-6">
                {/* Saved addresses */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A550]" />
                  <h3 className="text-[15px] font-bold text-gray-900">
                    Saved Addresses
                  </h3>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Select a saved address or enter a new one below
                </p>

                {addresses.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {addresses.map((a) => {
                      const key = addressKey(a);
                      const selected = selectedAddressKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => selectSavedAddress(a)}
                          className={`w-full text-left flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                            selected
                              ? "border-[#22C55E] bg-[#F0FDF4]"
                              : "border-gray-200 bg-white hover:border-[#22C55E]/50"
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              selected
                                ? "bg-gradient-to-br from-[#009B4D] to-[#38C25B] shadow-md shadow-green-600/20"
                                : "bg-gray-100"
                            }`}
                          >
                            {selected ? (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            ) : (
                              <MapPin className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[15px] font-bold truncate ${
                                selected ? "text-[#15803D]" : "text-gray-900"
                              }`}
                            >
                              {a.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {addressDetails(a)}
                            </p>
                            <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" />
                                {a.phone}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                {a.city}
                              </span>
                            </div>
                          </div>

                          {!selected && (
                            <span className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Use a different address */}
                <button
                  type="button"
                  onClick={() => selectManualAddress()}
                  className={`mt-3 w-full text-left flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    useNewAddress
                      ? "border-dashed border-[#22C55E] bg-[#F0FDF4]"
                      : "border-dashed border-gray-300 bg-white hover:border-[#22C55E]/60"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      useNewAddress
                        ? "bg-gradient-to-br from-[#009B4D] to-[#38C25B] shadow-md shadow-green-600/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <Plus
                      className={`w-5 h-5 ${
                        useNewAddress ? "text-white" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-[15px] font-bold ${
                        useNewAddress ? "text-[#15803D]" : "text-gray-800"
                      }`}
                    >
                      Use a different address
                    </p>
                    <p className="text-sm text-gray-500">
                      Enter a new shipping address manually
                    </p>
                  </div>
                </button>

                {/* ---------------------- Address form ----------------------
                    دايمًا معروض: عنوان محفوظ = pre-filled + قابل للتعديل */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                    {/* Delivery info banner */}
                    <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                      <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4 text-white" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-blue-700">
                          Delivery Information
                        </p>
                        <p className="text-sm text-blue-600">
                          {useNewAddress
                            ? "Please ensure your address is accurate for smooth delivery"
                            : "Using your saved address. You can edit the details below if needed."}
                        </p>
                      </div>
                    </div>

                    {/* City */}
                    <div className="mt-5">
                      <label
                        htmlFor="checkout-city"
                        className="block text-sm font-semibold text-gray-900 mb-1.5"
                      >
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Cairo, Alexandria, Giza"
                          className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 ${
                            fieldErrors.city ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {fieldErrors.city && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
                      )}
                    </div>

                    {/* Street */}
                    <div className="mt-4">
                      <label
                        htmlFor="checkout-street"
                        className="block text-sm font-semibold text-gray-900 mb-1.5"
                      >
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-4 pointer-events-none" />
                        <textarea
                          id="checkout-street"
                          rows={3}
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Street name, building number, floor, apartment..."
                          className={`w-full rounded-xl border bg-white pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none transition-colors focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 ${
                            fieldErrors.street ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                      </div>
                      {fieldErrors.street && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldErrors.street}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="mt-4">
                      <label
                        htmlFor="checkout-phone"
                        className="block text-sm font-semibold text-gray-900 mb-1.5"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="checkout-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          className={`w-full rounded-xl border bg-white pl-10 pr-36 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 ${
                            fieldErrors.phone ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          Egyptian numbers only
                        </span>
                      </div>
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>
              </div>
            </section>

            {/* ------------------------- Payment card ------------------------- */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#009448] via-[#12A24F] to-[#25AE5B] text-white px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Payment Method</h2>
                </div>
                <p className="mt-0.5 text-sm text-white/85">
                  Choose how you&apos;d like to pay
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPayment("cash")}
                  className={`w-full text-left flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    payment === "cash"
                      ? "border-[#22C55E] bg-[#F0FDF4]"
                      : "border-gray-200 bg-white hover:border-[#22C55E]/50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      payment === "cash"
                        ? "bg-gradient-to-br from-[#009B4D] to-[#38C25B] shadow-md shadow-green-600/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <Banknote
                      className={`w-5 h-5 ${
                        payment === "cash" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[15px] font-bold ${
                        payment === "cash" ? "text-[#15803D]" : "text-gray-900"
                      }`}
                    >
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when your order arrives at your doorstep
                    </p>
                  </div>

                  <PaymentCheck selected={payment === "cash"} />
                </button>

                {/* Pay Online */}
                <button
                  type="button"
                  onClick={() => setPayment("online")}
                  className={`w-full text-left flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    payment === "online"
                      ? "border-[#22C55E] bg-[#F0FDF4]"
                      : "border-gray-200 bg-white hover:border-[#22C55E]/50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      payment === "online"
                        ? "bg-gradient-to-br from-[#009B4D] to-[#38C25B] shadow-md shadow-green-600/20"
                        : "bg-gray-100"
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${
                        payment === "online" ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[15px] font-bold ${
                        payment === "online" ? "text-[#15803D]" : "text-gray-900"
                      }`}
                    >
                      Pay Online
                    </p>
                    <p className="text-sm text-gray-500">
                      Secure payment with Credit/Debit Card via Stripe
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {/* VISA */}
                      <span className="h-4 px-1.5 rounded-[3px] bg-white border border-gray-200 flex items-center justify-center text-[7px] font-extrabold tracking-wider text-blue-700">
                        VISA
                      </span>
                      {/* Mastercard */}
                      <span className="h-4 px-1 rounded-[3px] bg-white border border-gray-200 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                        <span className="w-2.5 h-2.5 -ml-1 rounded-full bg-red-500/90" />
                      </span>
                      {/* AMEX */}
                      <span className="h-4 px-1.5 rounded-[3px] bg-blue-600 flex items-center justify-center text-[7px] font-extrabold tracking-wider text-white">
                        AMEX
                      </span>
                    </div>
                  </div>

                  <PaymentCheck selected={payment === "online"} />
                </button>

                {/* Secure banner */}
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#15803D]">
                      Secure &amp; Encrypted
                    </p>
                    <p className="text-xs text-[#16A34A]">
                      Your payment info is protected with 256-bit SSL encryption
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* =========================== RIGHT COLUMN ========================== */}
          <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-6">
            <div className="bg-gradient-to-r from-[#009448] via-[#12A24F] to-[#25AE5B] text-white px-6 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-bold">Order Summary</h2>
              </div>
              <p className="mt-0.5 text-sm text-white/85">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </p>
            </div>

            <div className="p-6">
              {/* Items list */}
              <div className="checkout-summary-scroll max-h-[300px] overflow-y-auto pr-1 space-y-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {it.image ? (
                        <Image
                          src={it.image}
                          alt={it.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain p-0.5"
                         
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {it.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {it.count} × {formatMoney(it.unitPrice)} EGP
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      {formatMoney(it.unitPrice * it.count)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMoney(subtotal)}{" "}
                    <span className="text-xs font-normal text-gray-500">EGP</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-gray-400" />
                    Shipping
                  </span>
                  <span className="text-sm font-bold text-[#16A34A]">FREE</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-right">
                    <span className="text-2xl font-extrabold text-[#00A550]">
                      {formatMoney(subtotal)}
                    </span>{" "}
                    <span className="text-xs text-gray-500">EGP</span>
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !cartId}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl py-3.5 bg-gradient-to-r from-[#009448] to-[#25AE5B] text-white font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/30 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : payment === "cash" ? (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Place Order
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {submitError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Trust row */}
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                  Secure
                </span>
                <span className="w-px h-3.5 bg-gray-200" />
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  Fast Delivery
                </span>
                <span className="w-px h-3.5 bg-gray-200" />
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-orange-500" />
                  Easy Returns
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Small pieces ------------------------------- */

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
      <Link href="/" className="hover:text-[#00A550] transition-colors">
        Home
      </Link>
      <span className="text-gray-400">/</span>
      <Link href="/cart" className="hover:text-[#00A550] transition-colors">
        Cart
      </Link>
      <span className="text-gray-400">/</span>
      <span className="text-gray-900 font-bold">Checkout</span>
    </nav>
  );
}

function PaymentCheck({ selected }: { selected: boolean }) {
  return selected ? (
    <span className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
      <Check className="w-4 h-4 text-white" strokeWidth={3} />
    </span>
  ) : (
    <span className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0" />
  );
}
