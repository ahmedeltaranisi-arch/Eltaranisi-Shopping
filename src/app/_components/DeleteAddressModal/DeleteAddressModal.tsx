"use client";

import { BeatLoader } from "react-spinners";
import { Trash2 } from "lucide-react";
import type { AddressType } from "@/app/_apis/profile.api";

interface DeleteAddressModalProps {
  address: AddressType;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// مودال تأكيد الحذف — Spinner أثناء انتظار الـ API
export default function DeleteAddressModal({
  address,
  busy,
  onCancel,
  onConfirm,
}: DeleteAddressModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Remove Address"
        className="bg-white rounded-2xl w-full max-w-sm p-7 text-center shadow-2xl"
      >
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-extrabold text-[#14171A] mt-4">
          Remove Address?
        </h3>
        <p className="text-[13px] text-[#8A857B] mt-2 leading-relaxed">
          Remove{" "}
          <span className="font-bold text-[#14171A] break-words">
            {address.name}
          </span>{" "}
          from your addresses?
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="bg-[#F1F2F4] hover:bg-[#E7E5E1] text-[#4B5563] text-sm font-bold rounded-lg py-2.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg py-2.5 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-70"
          >
            {busy ? <BeatLoader size={8} color="#ffffff" /> : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
