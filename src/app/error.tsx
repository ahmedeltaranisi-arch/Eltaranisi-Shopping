"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // نسجّل الخطأ للمراقبة من غير ما نعرضه للمستخدم
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#F6F7F5] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-500">
          An unexpected error occurred while loading this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 bg-[#00B250] hover:bg-[#009B4D] text-white text-sm font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" /> Try again
        </button>
      </div>
    </div>
  );
}
