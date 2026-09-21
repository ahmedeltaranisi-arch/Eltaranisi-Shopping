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
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Product added successfully");

        // 🔑🔑 أهم سطر في الملف:
        // نمسح كاش السلة عشان أي صفحة بتستخدم queryKey: ["getCart"]
        // (زي صفحة الـ Cart) تجيب البيانات الجديدة فوراً
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
      } else if (res.status === 401) {
        toast.error("Please log in to add items to your cart");
      } else {
        toast.error(res.message || "Something went wrong");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
      console.error("Error adding to cart:", error);
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