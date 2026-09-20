"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { BeatLoader } from "react-spinners";
import { X } from "lucide-react";
import {
  addAddress,
  updateAddress,
  type AddressType,
} from "@/app/_apis/profile.api";

const phoneRegex = /^01[0125][0-9]{8}$/;

const schema = z.object({
  name: z.string().min(1, "Address name is required"),
  details: z.string().min(1, "Full address is required"),
  phone: z
    .string()
    .regex(
      phoneRegex,
      "Enter a valid Egyptian phone number (e.g. 01028968775)",
    ),
  city: z.string().min(1, "City is required"),
});

type FormValues = z.infer<typeof schema>;

interface AddressModalProps {
  mode: "add" | "edit";
  address?: AddressType | null;
  onClose: () => void;
  onSaved: () => void;
}

// مودال موحّد: mode="add" لإضافة عنوان جديد — mode="edit" لتعديل عنوان موجود
export default function AddressModal({
  mode,
  address,
  onClose,
  onSaved,
}: AddressModalProps) {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", details: "", phone: "", city: "" },
  });

  // في وضع التعديل: بنحط بيانات العنوان في الفورم
  useEffect(() => {
    if (isEdit && address) {
      reset({
        name: address.name,
        details: address.details,
        phone: address.phone,
        city: address.city,
      });
    }
  }, [isEdit, address, reset]);

  // إغلاق بـ Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSubmitting, onClose]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && address) {
        await updateAddress(address._id, values);
        toast.success("Address updated successfully");
      } else {
        await addAddress(values);
        toast.success("Address added successfully");
      }
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  const inputClass = (hasError?: boolean) =>
    `w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[#14171A] outline-none transition-colors placeholder:text-[#B0B7C3] focus:border-[#00B250] focus:ring-4 focus:ring-[#00B250]/10 ${
      hasError ? "border-red-500" : "border-[#E7E5E1]"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit Address" : "Add New Address"}
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[calc(100vh-2rem)] overflow-auto"
      >
        {/* Head */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-extrabold text-[#14171A]">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-[#F1F2F4] text-[#4B5563] hover:bg-[#E7E5E1] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Address Name */}
          <div className="mt-4">
            <label
              htmlFor="addr-name"
              className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
            >
              Address Name
            </label>
            <input
              id="addr-name"
              placeholder="e.g. Home, Office"
              autoFocus
              {...register("name")}
              className={inputClass(!!errors.name)}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-red-500 mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Full Address */}
          <div className="mt-4">
            <label
              htmlFor="addr-details"
              className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
            >
              Full Address
            </label>
            <textarea
              id="addr-details"
              rows={4}
              placeholder="Street, building, apartment…"
              {...register("details")}
              className={`${inputClass(!!errors.details)} resize-y min-h-[96px]`}
            />
            {errors.details && (
              <p className="text-xs font-semibold text-red-500 mt-1.5">
                {errors.details.message}
              </p>
            )}
          </div>

          {/* Phone + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="addr-phone"
                className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="addr-phone"
                placeholder="01xxxxxxxxx"
                inputMode="numeric"
                {...register("phone")}
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && (
                <p className="text-xs font-semibold text-red-500 mt-1.5">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="addr-city"
                className="block text-[13px] font-semibold text-[#4B5563] mb-1.5"
              >
                City
              </label>
              <input
                id="addr-city"
                placeholder="Cairo"
                {...register("city")}
                className={inputClass(!!errors.city)}
              />
              {errors.city && (
                <p className="text-xs font-semibold text-red-500 mt-1.5">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-[#F1F2F4] hover:bg-[#E7E5E1] text-[#4B5563] text-sm font-bold rounded-lg py-2.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00B250] hover:bg-[#009B4D] text-white text-sm font-bold rounded-lg py-2.5 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <BeatLoader size={8} color="#ffffff" />
              ) : isEdit ? (
                "Update"
              ) : (
                "Add Address"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
