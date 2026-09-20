'use client'

import { useEffect } from 'react'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-[#F6F7F5]">
      <span className="text-4xl">⚠️</span>
      <div>
        <h2 className="text-lg font-bold text-[#14171A]">Couldn&apos;t load the catalog</h2>
        <p className="mt-1 text-sm text-[#8A857B] max-w-sm">
          Something broke while loading the products. Check your connection and try again.
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#14171A] text-white hover:bg-[#2B2F33] transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
