"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getWishlist } from "@/app/actions/wishlistActions/getWishlist";
import { removeFromWishlist } from "@/app/actions/wishlistActions/removeFromWishlist";
import { addToCart } from "@/app/actions/cartActions/addToCart";
import {
  Heart,
  Trash2,
  Loader2,
  Package,
  LogIn,
  RefreshCcw,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

export default function WishlistComp() {
  const queryClient = useQueryClient();

  /* 🆕 مودال تأكيد الحذف — نفس فكرة السلة */
  const [confirm, setConfirm] = useState(null); // { id, title }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getWishlist"],
    queryFn: getWishlist,
    retry: 1,
  });

  /* 🗑 حذف من الـ wishlist */
  const removeItem = useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message || "Product removed from your wishlist");
      } else if (res?.status === 401) {
        toast.error("Please log in to manage your wishlist");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    },
    onError: (e) => {
      toast.error(e?.message || "Something went wrong");
      console.error("Error removing from wishlist:", e);
    },
    onSettled: () => {
      setConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["getWishlist"] });
    },
  });

  /* 🛒 نقل المنتج للسلة (بيحدّث badge السلة في الـ navbar كمان) */
  const moveToCart = useMutation({
    mutationFn: addToCart,
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message || "Product added to your cart");
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
      } else if (res?.status === 401) {
        toast.error("Please log in to add items to your cart");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    },
    onError: (e) => {
      toast.error(e?.message || "Something went wrong");
      console.error("Error adding to cart:", e);
    },
  });

  /* ① لو مش مسجل دخول */
  if (
    data?.status === "unauthorized" ||
    error?.status === 401 ||
    /unauthorized/i.test(error?.message || "")
  ) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-20 flex flex-col items-center text-center min-h-[50vh]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <LogIn className="text-gray-300 w-10 h-10" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Please log in first
        </h2>
        <p className="text-gray-500 mb-6">
          Please log in to view your wishlist.
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

  if (isError) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <p className="text-red-500 font-bold mb-4">
          {error?.message ||
            "Something went wrong while fetching your wishlist."}
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

  /* ② استخراج مرن */
  const raw = data || {};
  const itemsRaw = Array.isArray(raw?.data) ? raw.data : [];
  const wishItems = itemsRaw.map((it) => ({
    id: String(it?.id ?? it?._id ?? it),
    title: it?.title || "Product",
    price: it?.price ?? it?.priceAfterDiscount ?? 0,
    image: it?.imageCover ?? it?.images?.[0] ?? null,
    category: it?.category?.name ?? null,
  }));
  const wishCount = raw?.count ?? wishItems.length;

  if (wishItems.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Heart className="text-gray-300 w-12 h-12" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-500 mb-6 text-center">
          Looks like you haven&apos;t saved anything yet. <br />
          Start exploring our products!
        </p>
        <Link
          href="/products"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-200"
        >
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
        / <span className="text-gray-800">My Wishlist</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-red-500 p-2 rounded-lg text-white">
            <Heart size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Wishlist</h1>
        </div>
        <p className="text-gray-600 text-sm">
          You have{" "}
          <span className="font-bold text-red-500">{wishCount} items</span> in
          your wishlist
        </p>
      </div>

      {/* الكروت */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishItems.map((item) => {
          const isRemovingThis =
            removeItem.isPending && removeItem.variables === item.id;
          const isAddingThis =
            moveToCart.isPending && moveToCart.variables === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
            >
              {/* الصورة — لينك لصفحة تفاصيل المنتج */}
              <Link
                href={`/productDetails/${item.id}`}
                className="relative h-52 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 mb-3 overflow-hidden hover:border-green-300 transition-colors"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={200}
                    height={190}
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <Package className="text-gray-300" size={40} />
                )}
              </Link>

              {/* التفاصيل */}
              <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1">
                <Link
                  href={`/productDetails/${item.id}`}
                  className="hover:text-green-600 transition-colors"
                >
                  {item.title}
                </Link>
              </h3>
              {item.category && (
                <span className="self-start bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[11px] font-semibold mb-2">
                  {item.category}
                </span>
              )}
              <div className="mt-auto pt-2">
                <span className="font-extrabold text-green-600 text-lg">
                  {item.price}{" "}
                  <span className="text-xs text-gray-400 font-normal">EGP</span>
                </span>
              </div>

              {/* الأزرار */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  disabled={isAddingThis}
                  onClick={() => moveToCart.mutate(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isAddingThis ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={14} />
                  )}
                  Add to Cart
                </button>
                <button
                  type="button"
                  title="Remove from Wishlist"
                  disabled={isRemovingThis}
                  onClick={() => setConfirm({ id: item.id, title: item.title })}
                  className="p-2.5 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isRemovingThis ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* مودال تأكيد الحذف — نفس تصميم السلة */}
      {confirm && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          style={{ animation: "overlayFade .15s ease-out" }}
          onClick={() => !removeItem.isPending && setConfirm(null)}
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
              Remove Item?
            </h3>
            <p className="text-sm text-gray-500 mb-7">
              Remove{" "}
              <span className="font-bold text-gray-800">{confirm.title}</span>{" "}
              from your wishlist?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={removeItem.isPending}
                onClick={() => setConfirm(null)}
                className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removeItem.isPending}
                onClick={() => removeItem.mutate(confirm.id)}
                className="min-w-[110px] px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {removeItem.isPending ? (
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
