"use client";
import React, { ReactNode } from "react";
import { addToCart } from "@/app/actions/cartActions/addToCart";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddBtn({
  cls,
  child,
  prodId,
}: {
  cls: string;
  child: ReactNode;
  prodId: string;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      if (
        data?.status === "success" ||
        data?.message === "Product added successfully to your cart"
      ) {
        toast.success(data?.message || "Product added successfully");

        // 🔑🔑 أهم سطر في الملف:
        // نمسح كاش السلة عشان أي صفحة بتستخدم queryKey: ["getCart"]
        // (زي صفحة الـ Cart) تجيب البيانات الجديدة فوراً
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    },
    onError: (error: any) => {
      toast.error("Please log in to add items to your cart");
      console.error("🔴 Error adding to cart:", error);
    },
  });

  return (
    <button
      type="button"
      aria-label="Add to cart"
      disabled={isPending}
      className={`${cls} ${isPending ? "opacity-60 pointer-events-none cursor-pointer" : ""}`}
      onClick={(e) => {
        e.preventDefault();      // أمان: لو الزرار اتحط جوه Link في أي وقت
        e.stopPropagation();
        mutate(prodId);
      }}
    >
      {child}
    </button>
  );
}