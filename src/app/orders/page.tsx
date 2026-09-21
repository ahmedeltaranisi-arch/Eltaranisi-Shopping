"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Archive,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

const API_V1 = "/api/ext/v1";

/*
  إخفاء الأوردرات محليًا باستخدام localStorage.
  ده مش حذف للأوردرات من السيرفر.
*/
const HIDDEN_ORDERS_KEY = "hidden_orders";

function getHiddenOrders(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HIDDEN_ORDERS_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(list)
      ? list.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function hideOrder(id: string) {
  const list = getHiddenOrders();

  if (!list.includes(id)) {
    list.push(id);
  }

  localStorage.setItem(HIDDEN_ORDERS_KEY, JSON.stringify(list));
}

/* ---------------------------------- Types ---------------------------------- */

type OrderProduct = {
  _id?: string;
  id?: string;
  title?: string;
  imageCover?: string;
  images?: (string | { url?: string })[];
  price?: number;
  priceAfterDiscount?: number;
};

type OrderCartItem = {
  _id?: string;
  product?: OrderProduct;
  price?: number;
  count?: number;
  quantity?: number;
};

type Order = {
  _id: string;
  id?: number;
  cartItems?: OrderCartItem[];
  totalOrderPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  shippingAddress?: {
    details?: string;
    phone?: string;
    city?: string;
  };
  paymentMethodType?: string;
  isPaid?: boolean;
  isDelivered?: boolean;
  status?: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
};

type StatusInfo = {
  label: string;
  pill: string;
  dot: string;
};

/* --------------------------------- Helpers --------------------------------- */

/*
  كل النداءات بتم عن طريق البروكسي الآمن /api/ext — التوكن بيتحط على السيرفر
  ومش بيتحفظ في المتصفح.
*/
async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await fetch(`/api/ext/${url.replace(/^\/api\/ext\//, "")}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    const message =
      (payload as { message?: string } | null)?.message ??
      `Request failed (${response.status})`;

    const error = new Error(message);

    if (response.status === 401) {
      error.name = "UnauthorizedError";
    }

    throw error;
  }

  return payload;
}

async function fetchMyOrders(): Promise<{ orders: Order[]; userName: string }> {
  const me = await fetchJson(`${API_V1}/users/getMe`);

  const user = me?.data ?? me?.user;
  const userId = String(user?._id ?? user?.id ?? "");

  if (!userId) {
    throw new Error("Could not determine your account id.");
  }

  let payload;

  try {
    payload = await fetchJson(`${API_V1}/orders/user/${userId}`);
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      throw err;
    }

    payload = await fetchJson(`${API_V1}/orders`);
  }

  const list = Array.isArray(payload) ? payload : (payload?.data ?? []);

  const orders: Order[] = Array.isArray(list) ? list : [];

  return {
    orders,
    userName: String(user?.name ?? ""),
  };
}

/* --------------------------------- Display --------------------------------- */

function statusInfo(o: Order): StatusInfo {
  const known: Record<string, StatusInfo> = {
    pending: {
      label: "Processing",
      pill: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    processing: {
      label: "Processing",
      pill: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    confirmed: {
      label: "Confirmed",
      pill: "bg-sky-100 text-sky-700",
      dot: "bg-sky-500",
    },
    paid: {
      label: "Paid",
      pill: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
    },
    shipped: {
      label: "Shipped",
      pill: "bg-indigo-100 text-indigo-700",
      dot: "bg-indigo-500",
    },
    delivered: {
      label: "Delivered",
      pill: "bg-green-100 text-[#15803D]",
      dot: "bg-[#16A34A]",
    },
    cancelled: {
      label: "Cancelled",
      pill: "bg-red-100 text-red-600",
      dot: "bg-red-400",
    },
    canceled: {
      label: "Cancelled",
      pill: "bg-red-100 text-red-600",
      dot: "bg-red-400",
    },
  };

  const byStatus = known[(o.status ?? "").trim().toLowerCase()];

  if (byStatus) return byStatus;
  if (o.isDelivered) return known.delivered;
  if (o.isPaid) return known.paid;

  return known.pending;
}

function formatDate(s?: string | null): string {
  if (!s) return "—";

  const date = new Date(s);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const formatMoney = (value: number) =>
  value.toLocaleString("en-US");

function itemImage(product?: OrderProduct): string {
  if (!product) return "";
  if (product.imageCover) return product.imageCover;

  const first = product.images?.[0];

  if (typeof first === "string") {
    return first;
  }

  if (first && typeof first.url === "string") {
    return first.url;
  }

  return "";
}

function orderItems(order: Order): OrderCartItem[] {
  return Array.isArray(order.cartItems) ? order.cartItems : [];
}

function orderTotalItems(order: Order): number {
  return orderItems(order).reduce(
    (sum, item) =>
      sum + (Number(item.count ?? item.quantity ?? 1) || 1),
    0,
  );
}

/* ================================= Component ================================ */

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [authIssue, setAuthIssue] = useState<
    null | "missing" | "expired"
  >(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState("");
  const [lightbox, setLightbox] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(
    null,
  );

  const { status } = useSession();

  function requestCancel(id: string) {
    setCancelTarget(
      orders.find((order) => order._id === id) ?? null,
    );
  }

  function confirmCancel() {
    if (!cancelTarget) return;

    hideOrder(cancelTarget._id);

    setOrders((prev) =>
      prev.filter((order) => order._id !== cancelTarget._id),
    );

    setCancelTarget(null);
  }

  /* -------------------------------- Loading -------------------------------- */

  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setAuthIssue(null);

      // مفيش جلسة → شاشة "سجل الدخول الأول"
      if (status === "unauthenticated") {
        setAuthIssue("missing");
        setLoading(false);
        return;
      }

      try {
        const { orders: list, userName: name } = await fetchMyOrders();

        if (cancelled) return;

        const hidden = getHiddenOrders();

        setOrders(
          list.filter((order) => !hidden.includes(order._id)),
        );
        setUserName(name);
      } catch (err) {
        if (cancelled) return;

        console.error("[orders] load failed:", err);

        if (
          err instanceof Error &&
          err.name === "UnauthorizedError"
        ) {
          setAuthIssue("expired");
          return;
        }

        setLoadError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [status]);

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
            Loading your orders...
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
            {authIssue === "missing"
              ? "Please log in first"
              : "Your session has expired"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {authIssue === "missing"
              ? "You need to be logged in to see your orders."
              : "Please log in again to continue."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/Login"
              className="px-5 py-2.5 rounded-lg bg-[#00A550] text-white text-sm font-semibold hover:bg-[#008A43] transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Back Home
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
            We couldn&apos;t load your orders
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {loadError}
          </p>

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

  /* ------------------------------ Empty UI --------------------------------- */

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white" style={fontStyle}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <Breadcrumb />
          <Header count={0} />

          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F1F3F5] flex items-center justify-center">
              <Package className="w-7 h-7 text-[#9AA3AF]" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-[15px] text-gray-500">
              When you place your first order it will show up here.
            </p>

            <Link
              href="/products"
              className="inline-block mt-7 px-5 py-2.5 rounded-lg bg-[#22C55E] text-white text-sm font-semibold hover:bg-[#1DA851] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================================== Page ================================== */

  return (
    <div className="min-h-screen bg-white" style={fontStyle}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Breadcrumb />

        <Header
          count={orders.length}
          userName={userName}
        />

        <div className="mt-6 space-y-5">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onShowImages={() => setLightbox(order)}
              onCancel={() => requestCancel(order._id)}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-5 relative shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close order images"
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-4">
              Order Images
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {orderItems(lightbox).map((item, idx) => {
                const img = itemImage(item.product);

                return (
                  <div
                    key={item._id ?? idx}
                    className="rounded-xl bg-gray-50 border border-gray-100 aspect-square overflow-hidden flex items-center justify-center"
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={item.product?.title ?? "Product"}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain p-2"
                       
                      />
                    ) : (
                      <Package className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Remove order confirmation */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setCancelTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              Remove Order?
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Remove{" "}
              <span className="font-bold text-gray-900">
                Order #
                {cancelTarget.id != null
                  ? cancelTarget.id
                  : String(cancelTarget._id).slice(-6)}
              </span>{" "}
              from your orders?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmCancel}
                className="px-6 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Small pieces ------------------------------- */

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
      <Link
        href="/"
        className="hover:text-[#00A550] transition-colors"
      >
        Home
      </Link>

      <span className="text-gray-400">/</span>

      <span className="text-gray-900 font-bold">
        My Orders
      </span>
    </nav>
  );
}

function Header({
  count,
  userName,
}: {
  count: number;
  userName?: string;
}) {
  return (
    <div className="mt-5 mb-2 flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#22C55E] flex items-center justify-center shrink-0">
          <Archive className="w-7 h-7 text-white" />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            My Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {userName ? `Welcome back, ${userName}. ` : ""}
            Track and manage your{" "}
            <span className="font-bold text-gray-900">
              {count} order{count === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      </div>

      <Link
        href="/products"
        className="flex items-center gap-2 text-sm font-bold text-[#00A550] hover:text-[#008A43] transition-colors shrink-0 pt-1"
      >
        <ShoppingBag className="w-4 h-4" />
        Continue Shopping
      </Link>
    </div>
  );
}

/* -------------------------------- Order Card ------------------------------- */

function OrderCard({
  order,
  onShowImages,
  onCancel,
}: {
  order: Order;
  onShowImages: () => void;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const items = orderItems(order);
  const totalItems = orderTotalItems(order);
  const total = Number(order.totalOrderPrice ?? 0);
  const st = statusInfo(order);
  const addr = order.shippingAddress;

  const orderNo =
    order.id != null
      ? String(order.id)
      : String(order._id).slice(-6);

  const firstImage = itemImage(items[0]?.product);

  return (
    <section
      className={`bg-white rounded-2xl shadow-sm transition-all duration-300 ${
        expanded
          ? "border-2 border-[#22C55E]/60"
          : "border border-gray-200"
      }`}
    >
      <div className="p-6">
        {/* ------------------------- Card header row ------------------------- */}

        <div className="flex items-start gap-5">
          {/* Product image + count badge */}
          <div className="relative shrink-0">
            <div className="w-[72px] h-[72px] rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt={items[0]?.product?.title ?? "Product"}
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                 
                />
              ) : (
                <Package className="w-5 h-5 text-gray-300" />
              )}
            </div>

            {totalItems > 1 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                +{totalItems}
              </span>
            )}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${st.pill}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
              />
              {st.label}
            </span>

            {/* Order number */}
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-gray-400">
                #
              </span>

              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {orderNo}
              </span>
            </div>

            {/* Meta row */}
            <div className="mt-1.5 flex items-center gap-2.5 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {formatDate(order.createdAt)}
              </span>

              <span className="text-gray-300">•</span>

              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>

              <span className="text-gray-300">•</span>

              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {addr?.city ?? "—"}
              </span>
            </div>

            {/* Total */}
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-gray-900">
                {formatMoney(total)}
              </span>{" "}
              <span className="text-xs font-semibold text-gray-400">
                EGP
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-end justify-between gap-4 shrink-0">
            <button
              type="button"
              onClick={onShowImages}
              title="View order images"
              aria-label="View order images"
              className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  expanded
                    ? "bg-[#22C55E] text-white hover:bg-[#1DA851]"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {expanded ? "Hide" : "Details"}

                {expanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                title="Remove order"
                aria-label="Remove order"
                className="w-9 h-9 rounded-lg border border-red-200 bg-white flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------- Expanded details ----------------------- */}

        {expanded && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            {/* Order items */}
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-4 h-4 text-[#16A34A]" />

              <h4 className="text-sm font-bold text-gray-900">
                Order Items
              </h4>
            </div>

            <div className="space-y-2.5">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No items recorded for this order.
                </p>
              ) : (
                items.map((it, idx) => {
                  const p = it.product;

                  // معرّف المنتج نفسه وليس معرّف عنصر الأوردر.
                  const productId = p?._id || p?.id;

                  // نفس المسار المستخدم في ProductClientUI.
                  const productHref = productId
                    ? `/productDetails/${encodeURIComponent(productId)}`
                    : null;

                  const img = itemImage(p);

                  const count =
                    Number(it.count ?? it.quantity ?? 1) || 1;

                  const unit = Number(
                    p?.priceAfterDiscount ||
                      p?.price ||
                      it.price ||
                      0,
                  );

                  return (
                    <div
                      key={it._id ?? `${productId ?? idx}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
                    >
                      <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {img ? (
                          <Image
                            src={img}
                            alt={p?.title ?? "Product"}
                            width={44}
                            height={44}
                            className="w-full h-full object-contain"
                           
                          />
                        ) : (
                          <Package className="w-4 h-4 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* اسم المنتج: رابط للتفاصيل + hover أخضر */}
                        {productHref ? (
                          <Link
                            href={productHref}
                            className="block w-fit max-w-full truncate text-sm font-semibold text-gray-900 hover:text-[#1DA851] focus-visible:text-[#1DA851] transition-colors duration-200"
                          >
                            {p?.title ?? "Product"}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {p?.title ?? "Product"}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 mt-0.5">
                          {count} × {formatMoney(unit)} EGP
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {formatMoney(unit * count)}
                        </span>

                        <span className="text-[10px] font-semibold text-gray-400">
                          EGP
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Delivery address + Order summary */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Delivery Address */}
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-500" />

                  <h4 className="text-sm font-bold text-gray-900">
                    Delivery Address
                  </h4>
                </div>

                <p className="text-sm font-medium text-gray-900">
                  {addr?.city || "—"}
                </p>

                {addr?.details && (
                  <p className="mt-1 text-xs text-gray-500">
                    {addr.details}
                  </p>
                )}

                {addr?.phone && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {addr.phone}
                  </p>
                )}
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ReceiptText className="w-4 h-4 text-amber-500" />

                  <h4 className="text-sm font-bold text-gray-900">
                    Order Summary
                  </h4>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Subtotal
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {formatMoney(total)} EGP
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Shipping
                  </span>

                  <span className="text-sm font-semibold text-[#16A34A]">
                    Free
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-lg font-extrabold text-gray-900">
                    {formatMoney(total)} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}