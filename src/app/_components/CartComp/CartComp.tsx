"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ShoppingCart, Trash2, Minus, Plus, Tag, Lock,
  ShieldCheck, Truck, ArrowRight, ArrowLeft, Package, LogIn, RefreshCcw, Loader2,
} from "lucide-react";

/* ① قراءة آمنة للـ response: نفحص ok قبل الـ JSON
   عشان لو السيرفر رجّع HTML (صفحة خطأ) ماتضربش "Unexpected token '<'" */
async function readResponse(response) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`السيرفر رجّع رد غير JSON (status: ${response.status})`);
  }
  if (!response.ok) {
    const err = new Error(body?.message || `فشل الطلب (status: ${response.status})`);
    err.status = response.status; // عشان نعرف نتعامل مع 401
    throw err;
  }
  return body;
}

/* ② جلب السلة */
async function getCart() {
  const response = await fetch("/api/cart", { cache: "no-store" });
  return readResponse(response);
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/* 🔧 جرّب أكتر من شكل للـ endpoint لحد ما شكل ينجح:
   الشكل الأساسي = زي RouteMisr v2 بالظبط (الـ productId في المسار)
   ولو الـ route عندك مش دعم الشكل ده (404/405) → بينتقل للشكل الاحتياطي تلقائياً */
async function fetchWithFallback(attempts) {
  let lastError = null;
  for (const attempt of attempts) {
    const res = await fetch(attempt.url, attempt.options);
    if (res.status === 404 || res.status === 405 || res.status === 401) {
      lastError = new Error(`المسار ${attempt.url} مش مدعوم (status: ${res.status})`);
      continue; // الشكل ده مش موجود → جرّب اللي بعده
    }
    return readResponse(res); // لو الرد !ok هترمي error عادي
  }
  throw lastError || new Error("فشل الطلب");
}

/* 🔧 استخراج الـ id بتاع المنتج من الـ item (بيتعامل مع كل الأشكال) */
function getItemId(item) {
  const p = item?.product && typeof item.product === "object" ? item.product : null;
  return String(p?.id ?? p?._id ?? item?.product?._id ?? item?.productId ?? item?._id ?? "");
}

/* 🔧 تحديث الكمية داخل الكاش مباشرة (Optimistic Update)
   عشان الـ + والـ - والـ Total يغيروا فوراً من غير ما نستنى السيرفر */
function patchCartCount(old, productId, newCount) {
  if (!old) return old;
  const clone = JSON.parse(JSON.stringify(old));
  const arr = clone?.data?.products ?? clone?.data?.items ?? clone?.products ?? clone?.items;
  if (!Array.isArray(arr)) return old;

  const item = arr.find((x) => getItemId(x) === String(productId));
  if (!item) return old;

  const unit = item?.price ?? item?.product?.price ?? 0;
  const oldCount = item?.count ?? 1;
  item.count = newCount;

  const diff = (newCount - oldCount) * unit;
  if (typeof clone?.data?.totalCartPrice === "number") clone.data.totalCartPrice += diff;
  if (typeof clone?.totalCartPrice === "number") clone.totalCartPrice += diff;
  if (typeof clone?.numOfCartItems === "number") clone.numOfCartItems += newCount - oldCount;
  return clone;
}

export default function CartComp() {
  const queryClient = useQueryClient();

  /* 🆕 قراءة الـ token بتاع المستخدم من الـ session عشان نكلم RouteMisr مباشرة
     (لأن الـ console ورّى إن /api/cart مش بيدعم PUT/DELETE — بيرجع 405) */
  const { data: session } = useSession();
  const userToken =
    session?.accessToken ??
    session?.user?.token ??
    session?.user?.accessToken ??
    session?.user?.jwt ??
    null;
  const V1 = "https://ecommerce.routemisr.com/api/v1";
  const V2 = "https://ecommerce.routemisr.com/api/v2";

  /* 🔧 يبني قائمة المحاولات بالترتيب:
     1) مباشرة لـ RouteMisr بالـ token (v1 ثم v2) — زي الدوكيومنتيشن بالظبط
     2) أشكال الـ proxy بتاعتك (/api/cart/{id} ثم /api/cart) */
  function attemptsFor(method, productId, body) {
    const list = [];
    if (userToken) {
      for (const base of [V1, V2]) {
        list.push({
          url: `${base}/cart${productId ? `/${productId}` : ""}`,
          options: {
            method,
            headers: { "Content-Type": "application/json", token: userToken },
            body: body ? JSON.stringify(body) : undefined,
          },
        });
      }
    }
    if (productId) {
      list.push({
        url: `/api/cart/${productId}`,
        options: { method, headers: JSON_HEADERS, body: body ? JSON.stringify(body) : undefined },
      });
    }
    list.push({
      url: "/api/cart",
      options: {
        method,
        headers: JSON_HEADERS,
        body: JSON.stringify(productId ? { productId, ...body } : {}),
      },
    });
    return list;
  }

  /* 🆕 حالة المودال: حذف منتج واحد {kind:"single"} أو حذف كل المنتجات {kind:"all"} */
  const [confirm, setConfirm] = useState(null);

  const { data: cartData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getCart"],
    queryFn: getCart,
    retry: 1,
  });

  /* ③ تعديل الكمية — مع Optimistic Update عشان يكون ديناميكي ومتجاوب فوراً */
  const updateCount = useMutation({
    mutationFn: (vars) => fetchWithFallback(attemptsFor("PUT", vars.productId, { count: vars.count })),
    // 🔑 حدّث الكاش فوراً قبل رد السيرفر
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["getCart"] });
      const previous = queryClient.getQueryData(["getCart"]);
      queryClient.setQueryData(["getCart"], (old) =>
        patchCartCount(old, vars.productId, vars.count)
      );
      return { previous };
    },
    // لو السيرفر رفض، نرجّع البيانات القديمة
    onError: (err, _vars, ctx) => {
      console.error("فشل تعديل الكمية:", err); // افتح الـ console عشان تشوف الشكل اللي فشل
      if (ctx?.previous) queryClient.setQueryData(["getCart"], ctx.previous);
    },
    // وفي كل الأحوال نزامن مع السيرفر + الـ navbar بيتحدث لوحده (نفس الـ queryKey)
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["getCart"] }),
  });

  /* ④ حذف منتج واحد — بتتنادى من زرار Remove جوّه المودال */
  const removeItem = useMutation({
    mutationFn: (productId) => fetchWithFallback(attemptsFor("DELETE", productId)),
    onError: (e) => console.error("فشل حذف المنتج:", e),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["getCart"] }),
  });

  /* 🆕 مسح السلة كلها */
  const clearAll = useMutation({
    mutationFn: async (ids) => {
      // ✅ Clear User Cart: DELETE على /cart من غير body (v1 ثم v2)
      if (userToken) {
        try {
          return await fetchWithFallback([
            { url: `${V1}/cart`, options: { method: "DELETE", headers: { token: userToken } } },
            { url: `${V2}/cart`, options: { method: "DELETE", headers: { token: userToken } } },
          ]);
        } catch (e) {
          console.error("المسح الكلي المباشر فشل — هنمسح منتج منتج:", e);
        }
      }
      // 🔄 احتياطي: حذف منتج منتج بكل الأشكال الممكنة
      await Promise.all(
        ids.map((productId) => fetchWithFallback(attemptsFor("DELETE", productId)))
      );
    },
    onError: (e) => console.error("فشل مسح السلة:", e),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["getCart"] }),
  });

  const modalPending = removeItem.isPending || clearAll.isPending;

  /* ⑤ لو مش مسجل دخول */
  if (error?.status === 401) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-20 flex flex-col items-center text-center min-h-[50vh]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <LogIn className="text-gray-300 w-10 h-10" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {" "}
          Please log in first{" "}
        </h2>
        <p className="text-gray-500 mb-6">
          {" "}
          Please log in to view your shopping cart.{" "}
        </p>
        <Link
          href="/Login"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg shadow-green-200"
        >
          Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  /* ⑥ الخطأ دلوقتي بيعرض الرسالة الحقيقية + زرار إعادة محاولة */
  if (isError) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <p className="text-red-500 font-bold mb-4">
          {error?.message || "Something went wrong while fetching your cart."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer"
        >
          <RefreshCcw size={16} /> إعادة المحاولة
        </button>
      </div>
    );
  }

  /* ⑦ استخراج مرن يقبل كل أشكال الـ response الشائعة */
  const raw = cartData || {};
  const rawItems = raw?.data?.products ?? raw?.data?.items ?? raw?.products ?? raw?.items ?? [];
  const cartItems = Array.isArray(rawItems) ? rawItems : [];

  const totalCartPrice =
    raw?.data?.totalCartPrice ??
    cartItems.reduce((sum, it) => sum + (it?.price ?? 0) * (it?.count ?? 1), 0);

  const itemsCount =
    raw?.numOfCartItems ?? cartItems.reduce((sum, it) => sum + (it?.count ?? 1), 0);

  /* 🆕 تأكيد الحذف من المودال (منتج واحد أو الكل) */
  function handleConfirm() {
    if (!confirm || modalPending) return;
    if (confirm.kind === "single") {
      removeItem.mutate(confirm.productId, { onSettled: () => setConfirm(null) });
    } else {
      clearAll.mutate(cartItems.map(getItemId), { onSettled: () => setConfirm(null) });
    }
  }

  if (itemsCount === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="text-gray-300 w-12 h-12" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 text-center">
          Looks like you haven&apos;t added anything to your cart yet. <br />
          Start exploring our products!
        </p>
        <Link href="/products" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-200">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 font-sans">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-green-600">
          Home
        </Link>{" "}
        / <span className="text-gray-800">Shopping Cart</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-600 p-2 rounded-lg text-white">
            <ShoppingCart size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Shopping Cart
          </h1>
        </div>
        <p className="text-gray-600 text-sm">
          You have{" "}
          <span className="font-bold text-green-600">{itemsCount} items</span>{" "}
          in your cart
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* المنتجات */}
        <div className="w-full lg:flex-1 space-y-4">
          {cartItems.map((item) => {
            /* ⚠️ بعض الـ APIs بترجّع product كـ id نصي مش object — بنتعامل مع الحالتين */
            const p =
              item?.product && typeof item.product === "object"
                ? item.product
                : null;
            const productId = getItemId(item);
            const unitPrice = item?.price ?? p?.price ?? 0;
            const isUpdatingThis =
              updateCount.isPending &&
              updateCount.variables?.productId === productId;

            return (
              <div
                key={item._id ?? productId}
                className="flex flex-col sm:flex-row items-center sm:items-start p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow gap-4"
              >
                {/* الصورة */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-24 h-28 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 flex items-center justify-center p-2">
                    <Image
                      src={p?.imageCover || "https://placehold.co/100"}
                      alt={p?.title || "Product Image"}
                      width={80}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ In Stock
                  </span>
                </div>

                {/* التفاصيل */}
                <div className="flex-1 flex flex-col justify-between h-full w-full">
                  <div>
                   <h3 className="mb-1">
  <Link
    href={`/productDetails/${p?.id ?? ""}`}
    className="text-base font-bold text-gray-800 line-clamp-1 hover:text-[#00C950] transition duration-100"
  >
    {p?.title || "منتج"}
  </Link>
</h3>
                    <div className="flex items-center gap-2 text-xs mb-3">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-semibold ">
                        {p?.category?.name || "Category"}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        SKU: {p?.id?.slice(0, 6)?.toUpperCase() || "------"}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-green-600 text-lg">
                        {unitPrice} EGP
                      </span>{" "}
                      <span className="text-gray-400 text-xs">per unit</span>
                    </div>
                  </div>

                  {/* 🔄 الكمية — ديناميكية ومتجاوبة (Optimistic Update) */}
                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-stretch rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        disabled={(item.count ?? 1) <= 1 || isUpdatingThis}
                        onClick={() =>
                          updateCount.mutate({
                            productId,
                            count: (item.count ?? 1) - 1,
                          })
                        }
                      >
                        <Minus size={16} strokeWidth={2.5} />
                      </button>
                      <span className="w-12 flex items-center justify-center font-extrabold text-sm text-gray-900">
                        {item.count ?? 1}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 cursor-pointer"
                        disabled={isUpdatingThis}
                        onClick={() =>
                          updateCount.mutate({
                            productId,
                            count: (item.count ?? 1) + 1,
                          })
                        }
                      >
                        {isUpdatingThis ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* السعر والحذف */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto h-full sm:min-h-[112px]">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Total</p>
                    <p className="font-extrabold text-gray-900 text-lg">
                      {unitPrice * (item.count ?? 1)}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        EGP
                      </span>
                    </p>
                  </div>

                  {/* 🗑 زرار الحذف — بيفتح مودال التأكيد */}
                  <button
                    type="button"
                    title="Remove Item"
                    onClick={() =>
                      setConfirm({
                        kind: "single",
                        productId,
                        title: p?.title || "this item",
                      })
                    }
                    className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 rounded-xl transition-colors cursor-pointer mt-auto"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 🆕 الصف اللي بعد آخر منتج: Continue Shopping + Clear all items */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200">
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <button
              type="button"
              onClick={() => setConfirm({ kind: "all" })}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 size={16} /> Clear all items
            </button>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden sticky top-24">
          <div className="bg-green-700 p-4 text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Lock size={18} /> Order Summary
            </h2>
            <p className="text-green-100 text-sm">
              {itemsCount} items in your cart
            </p>
          </div>

          <div className="p-5">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-3 mb-6">
              <div className="bg-green-200 p-1.5 rounded-full text-green-700 shrink-0 mt-0.5">
                <Truck size={14} />
              </div>
              <div>
                <h4 className="font-bold text-green-800 text-sm">
                  Free Shipping!
                </h4>
                <p className="text-xs text-green-600 mt-0.5">
                  You qualify for free delivery
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 border-b border-dashed border-gray-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">{totalCartPrice} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-green-600">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {totalCartPrice}{" "}
                <span className="text-sm font-normal text-gray-500">EGP</span>
              </span>
            </div>

            <button
              type="button"
              className="w-full py-2.5 mb-3 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:border-green-500 hover:text-green-600 transition-colors cursor-pointer"
            >
              <Tag size={16} /> Apply Promo Code
            </button>

            <Link href="/checkout" className="block">
              <button
                type="button"
                className="w-full py-3.5 bg-green-700 hover:bg-green-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-green-100 transition-all cursor-pointer"
              >
                <Lock size={18} /> Secure Checkout
              </button>
            </Link>

            <div className="flex items-center justify-center gap-6 mt-5 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5 hover:text-green-600 transition-colors cursor-pointer">
                <ShieldCheck size={14} className="text-green-500" /> Secure
                Payment
              </div>
              <div className="flex items-center gap-1.5 hover:text-green-600 transition-colors cursor-pointer">
                <Truck size={14} className="text-blue-500" /> Fast Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 مودال تأكيد الحذف (منتج واحد أو كل المنتجات) */}
      {confirm && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          style={{ animation: "overlayFade .15s ease-out" }}
          onClick={() => !modalPending && setConfirm(null)}
        >
          <div
            className="w-full max-w-md bg-[#f7f7fa] rounded-2xl shadow-2xl p-8 text-center"
            style={{ animation: "modalPop .18s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <Trash2 size={26} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              {confirm.kind === "all" ? "Clear All Items?" : "Remove Item?"}
            </h3>
            <p className="text-sm text-gray-500 mb-7">
              {confirm.kind === "all" ? (
                <>
                  Remove{" "}
                  <span className="font-bold text-gray-800">
                    all {itemsCount} items
                  </span>{" "}
                  from your cart?
                </>
              ) : (
                <>
                  Remove{" "}
                  <span className="font-bold text-gray-800">
                    {confirm.title}
                  </span>{" "}
                  from your cart?
                </>
              )}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={modalPending}
                onClick={() => setConfirm(null)}
                className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalPending}
                onClick={handleConfirm}
                className="min-w-[110px] px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {modalPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes modalPop { from { opacity: 0; transform: scale(.92) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
          `}</style>
        </div>
      )}
    </div>
  );
}
