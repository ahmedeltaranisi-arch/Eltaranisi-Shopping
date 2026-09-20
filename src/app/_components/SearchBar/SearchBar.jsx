"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, PackageSearch } from "lucide-react";

/* 📦 جلب كل الكتالوج مرة واحدة (56 منتج = صفحتين) والكاش يخليه سريع دايماً
   ليه؟ لأن بحث الـ keyword في API بتاع RouteMisr مكسور وبيرجّع 0 دايماً —
   فبنبحث محلياً على الجهاز بدل ما نعتمد عليه */
async function fetchAllProducts() {
  const first = await fetch(
    "https://ecommerce.routemisr.com/api/v1/products?limit=50",
  ).then((r) => r.json());

  const pages = first?.metadata?.numberOfPages ?? 1;
  const restPromises = [];
  for (let p = 2; p <= pages; p++) {
    restPromises.push(
      fetch(
        `https://ecommerce.routemisr.com/api/v1/products?limit=50&page=${p}`,
      ).then((r) => r.json()),
    );
  }
  const rest = await Promise.all(restPromises);

  return [...(first?.data ?? []), ...rest.flatMap((j) => j?.data ?? [])];
}

/* 🔍 مطابقة ذكية: الاسم الكامل > كل الكلمات في الاسم > كل الكلمات في أي حاجة > بعض الكلمات في الاسم */
function searchProducts(list, q) {
  const norm = (s) => (s || "").toLowerCase();
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const scored = [];
  for (const p of list) {
    const title = norm(p.title);
    const hay = norm(
      [p.title, p.category?.name, p.brand?.name, p.description].join(" "),
    );

    let score = -1;
    if (title.includes(norm(q))) score = 0;
    else if (words.every((w) => title.includes(w))) score = 1;
    else if (words.every((w) => hay.includes(w))) score = 2;
    else if (words.some((w) => title.includes(w))) score = 3;

    if (score >= 0) scored.push([score, p]);
  }
  scored.sort((a, b) => a[0] - b[0]);
  return scored.map(([, p]) => p);
}

/* 🔍 بحث حي (Live Search): النتائج بتتفلتر محلياً مع كل حرف */
export default function SearchBar() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const router = useRouter();

  const { data: allProducts, isLoading: catalogLoading } = useQuery({
    queryKey: ["allProducts"],
    queryFn: fetchAllProducts,
    staleTime: 10 * 60 * 1000, // 10 دقايق — الكتالوج مش بيتغير كل ثانية
    refetchOnWindowFocus: false,
    retry: 1,
  });

  /* فلترة فورية مع Debounce خفيف 150ms */
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 150);
    return () => clearTimeout(t);
  }, [term]);

  const results = useMemo(
    () => (debounced ? searchProducts(allProducts ?? [], debounced) : []),
    [debounced, allProducts],
  );

  /* قفل القائمة لما تدوس برّهها */
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (debounced) setOpen(true);
    else setOpen(false);
  }, [debounced]);

  function go(id) {
    setOpen(false);
    setTerm("");
    router.push(`/productDetails/${id}`);
  }

  const shown = results.slice(0, 8);

  return (
    <div ref={boxRef} className="relative w-full">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && shown.length > 0) go(shown[0]._id);
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search for products, brands and more..."
        className="w-full pl-5 pr-12 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-400"
      />

      {/* العدسة / السبينر */}
      <div className="absolute right-1.5 top-0 h-full flex items-center">
        {catalogLoading ? (
          <span className="bg-green-600 text-white p-2 rounded-full flex items-center justify-center">
            <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
          </span>
        ) : (
          <button
            type="button"
            aria-label="Search"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* 📋 قائمة النتائج الفورية */}
      {open && debounced && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {catalogLoading ? (
            <div className="p-6 text-center text-sm text-gray-400 font-semibold flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading catalog...
            </div>
          ) : shown.length === 0 ? (
            <div className="p-6 text-center">
              <PackageSearch className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-500">
                No products found for &ldquo;{debounced}&rdquo;
              </p>
            </div>
          ) : (
            <>
              <ul className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                {shown.map((p) => (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => go(p._id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-left cursor-pointer"
                    >
                      <img
                        src={p.imageCover}
                        alt={p.title}
                        className="w-10 h-10 object-contain rounded-md bg-gray-50 border border-gray-100 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">
                          {p.category?.name}
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-green-600 shrink-0">
                        {p.priceAfterDiscount || p.price} EGP
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400">
                {results.length} result{results.length === 1 ? "" : "s"} for
                &ldquo;{debounced}&rdquo; — Enter opens the first
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
