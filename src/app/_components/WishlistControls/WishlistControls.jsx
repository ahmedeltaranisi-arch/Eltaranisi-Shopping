"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getWishlist } from "@/app/actions/wishlistActions/getWishlist";
import { addToWishlist } from "@/app/actions/wishlistActions/addToWishlist";
import { removeFromWishlist } from "@/app/actions/wishlistActions/removeFromWishlist";

/* 🔧 تحديث كاش الـ wishlist فوراً (Optimistic) عشان القلب/الـ badge يتغيروا لحظياً */
function patchWishlist(old, prodId, adding) {
  if (!old) return old;
  const clone = JSON.parse(JSON.stringify(old));
  const list = Array.isArray(clone?.data) ? clone.data : (clone.data = []);
  const exists = list.some(
    (it) => String(it?.id ?? it?._id ?? it) === String(prodId),
  );

  if (adding && !exists) {
    list.push({ id: prodId, title: "Product", price: 0 });
    if (typeof clone.count === "number") clone.count += 1;
  }
  if (!adding && exists) {
    clone.data = list.filter(
      (it) => String(it?.id ?? it?._id ?? it) !== String(prodId),
    );
    if (typeof clone.count === "number")
      clone.count = Math.max(0, clone.count - 1);
  }
  return clone;
}

/* 🔑 هوك مشترك: يعرف هل المنتج في الـ wishlist ويضيف/يشيل مع تحديث لحظي */
function useWishlist(prodId) {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const { data } = useQuery({
    queryKey: ["getWishlist"],
    queryFn: getWishlist,
    enabled: status === "authenticated", // منجيبش حاجة لو مش مسجل دخول
    retry: 0,
    refetchOnWindowFocus: true,
  });

  const list = Array.isArray(data?.data) ? data.data : [];
  const inWishlist = list.some(
    (it) => String(it?.id ?? it?._id ?? it) === String(prodId),
  );

  const add = useMutation({
    mutationFn: addToWishlist,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["getWishlist"] });
      const previous = queryClient.getQueryData(["getWishlist"]);
      queryClient.setQueryData(["getWishlist"], (old) =>
        patchWishlist(old, id, true),
      );
      return { previous };
    },
    onSuccess: (res) => {
      if (res?.status === "success" || /wishlist/i.test(res?.message || "")) {
        toast.success(res?.message || "Product added to your wishlist");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    },
    onError: (e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["getWishlist"], ctx.previous);
      toast.error("Please log in to add items to your wishlist");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["getWishlist"] }),
  });

  const remove = useMutation({
    mutationFn: removeFromWishlist,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["getWishlist"] });
      const previous = queryClient.getQueryData(["getWishlist"]);
      queryClient.setQueryData(["getWishlist"], (old) =>
        patchWishlist(old, id, false),
      );
      return { previous };
    },
    onSuccess: (res) =>
      toast.success(res?.message || "Product removed from your wishlist"),
    onError: (e, _v, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["getWishlist"], ctx.previous);
      toast.error("Please log in to manage your wishlist");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["getWishlist"] }),
  });

  const pending =
    (add.isPending && add.variables === prodId) ||
    (remove.isPending && remove.variables === prodId);

  function toggle() {
    if (pending) return;
    if (inWishlist) remove.mutate(prodId);
    else add.mutate(prodId);
  }

  return { inWishlist, pending, toggle };
}

/* ❤️ القلب العائم في كروت المنتجات (Products / CardOne) */
export function WishlistHeart({ prodId, className }) {
  const { inWishlist, pending, toggle } = useWishlist(prodId);

  return (
    <button
      type="button"
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault(); // أمان لو جوه Link
        e.stopPropagation();
        toggle();
      }}
      className={
        className ??
        "bg-white/80 p-2 rounded-full cursor-pointer shadow-md hover:bg-white transition-colors"
      }
    >
      {pending ? (
        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${
            inWishlist
              ? "fill-red-500 text-red-500 scale-110"
              : "text-[#8A857B]"
          }`}
        />
      )}
    </button>
  );
}

/* ❤️ زرار العرض العريض في صفحة تفاصيل المنتج — نفس شكل الصورة بالظبط */
export function WishlistDetailsBtn({ prodId }) {
  const { inWishlist, pending, toggle } = useWishlist(prodId);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 cursor-pointer disabled:opacity-60 ${
        inWishlist
          ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
          : "bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-500"
      }`}
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin text-red-500" />
      ) : (
        <Heart
          size={18}
          className={`transition-all duration-300 ${
            inWishlist ? "fill-red-600 text-red-600" : "text-gray-500"
          }`}
        />
      )}
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
