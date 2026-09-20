'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ProductDetailsError({
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
        <h2 className="text-lg font-bold text-[#14171A]">Couldn&apos;t load this product</h2>
        <p className="mt-1 text-sm text-[#8A857B] max-w-sm">
          Something broke while loading this product&apos;s details. Try again, or head back to the catalog.
        </p>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#14171A] text-white hover:bg-[#2B2F33] transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/products"
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#E7E5E1] text-[#14171A] hover:bg-white transition-colors"
        >
          Back to Catalog
        </Link>
      </div>
    </div>
  )
}
