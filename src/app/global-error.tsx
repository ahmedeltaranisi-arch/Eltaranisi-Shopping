"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F7F5] flex items-center justify-center px-4 font-sans">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-500">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 bg-[#00B250] hover:bg-[#009B4D] text-white text-sm font-bold rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
