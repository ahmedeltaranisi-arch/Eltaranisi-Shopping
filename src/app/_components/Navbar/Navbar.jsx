"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getWishlist } from "@/app/actions/wishlistActions/getWishlist";
import SearchBar from "@/app/_components/SearchBar/SearchBar";
import {
  Truck,
  Gift,
  Phone,
  Mail,
  User,
  UserPlus,
  ShoppingCart,
  Headphones,
  Heart,
  ChevronDown,
  Loader2,
  LogOut,
  Package,
  Contact,
  Settings,
  Menu,
  X,
} from "lucide-react";
import eltaranisiLogo from "@/assets/images/Eltaranisi.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ------------------------------ Static links ------------------------------ */
/* طلعناهم برّه الكومبوننت عشان الـ Navbar والـ MobileMenu يقروا من نفس المصدر */

const links = [
  { path: "/", element: "Home" },
  { path: "/products", element: "Shop" },
  { path: "/brands", element: "Brands" },
];

/* ✅ روابط التصنيفات — الـ ids جاية من API /categories (ثابتة)
   All Categories → /categories
   الباقي → /categories/<id> (صفحة الـ subcategories) */
const categoryLinks = [
  { name: "All Categories", href: "/categories" },
  { name: "Electronics", href: "/categories/6439d2d167d9aa4ca970649f" },
  { name: "Women's Fashion", href: "/categories/6439d58a0049ad0b52b9003f" },
  { name: "Men's Fashion", href: "/categories/6439d5b90049ad0b52b90048" },
  { name: "Beauty & Health", href: "/categories/6439d30b67d9aa4ca97064b1" },
];

const profileLinks = [
  {
    href: "/profile/addresses",
    label: "My Profile",
    Icon: User,
    color: "hover:text-[#10cc52]",
  },
  {
    href: "/orders",
    label: "My Orders",
    Icon: Package,
    color: "hover:text-[#2eca65]",
  },
  {
    href: "/wishlist",
    label: "My Wishlist",
    Icon: Heart,
    color: "hover:text-[#2eca65]",
  },
  {
    href: "/profile/settings",
    label: "Settings",
    Icon: Settings,
    color: "hover:text-[#2eca65]",
  },
];

const fontStyle = {
  fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
};

/* ================================= Navbar ================================= */

export default function Navbar() {
  const { data: session, status } = useSession();
  const path = usePathname();

  /* 📱 القائمة الجانبية — موبايل/تابلت فقط (تحت lg = 1024px) */
  const [menuOpen, setMenuOpen] = useState(false);

  /* 📱 أي تنقّل لصفحة تانية → القائمة تتقفل لوحدها
     (الـ pattern الرسمي من React docs لتعديل state مع تغيّر قيمة بدون useEffect) */
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setMenuOpen(false);
  }

  /* 📱 وهي مفتوحة: نمنع سكرول الصفحة + Esc يقفلها + لو الشاشة بقت lg تتقفل */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  /* 🆕 عدد منتجات السلة عشان الـ badge اللي على أيقونة السلة
     بنفس الـ queryKey بتاعة صفحة السلة ["getCart"] → أي تحديث هناك بيتحدث هنا فوراً */
  const { data: cartData } = useQuery({
    queryKey: ["getCart"],
    queryFn: async () => {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) throw new Error(`cart ${res.status}`);
      return res.json();
    },
    enabled: status === "authenticated", // مننديش طلب لو مش مسجل دخول (هيجيب 401)
    retry: 0,
    refetchOnWindowFocus: true, // يتحدث لما ترجع للتاب مثلاً
  });

  const rawCartItems =
    cartData?.data?.products ??
    cartData?.data?.items ??
    cartData?.products ??
    cartData?.items ??
    [];
  const cartCount =
    cartData?.numOfCartItems ??
    (Array.isArray(rawCartItems)
      ? rawCartItems.reduce((s, it) => s + (it?.count ?? 1), 0)
      : 0);

  /* 🆕 عدد منتجات الـ Wishlist عشان الـ badge على أيقونة القلب
     نفس فكرة السلة: queryKey ["getWishlist"] → أي إضافة/حذف بيتحدث هنا فوراً */
  const { data: wishData } = useQuery({
    queryKey: ["getWishlist"],
    queryFn: getWishlist,
    enabled: status === "authenticated",
    retry: 0,
    refetchOnWindowFocus: true,
  });
  const wishCount =
    wishData?.count ??
    (Array.isArray(wishData?.data) ? wishData.data.length : 0);

  function handleLogout() {
    signOut({ redirect: true, callbackUrl: "/Login" });
  }

  const userName = session?.user?.name || "My Account";

  return (
    <header
      style={fontStyle}
      className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm"
    >
      {/* 1. Top Bar — ديسكتوب فقط (lg+) */}
      <div className="bg-gray-50 border-b border-gray-100 py-2 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-green-600 cursor-pointer transition-colors">
              <Truck size={16} className="text-green-600" /> Free Shipping on
              Orders 500 EGP
            </span>
            <span className="flex items-center gap-1.5 hover:text-green-600 cursor-pointer transition-colors">
              <Gift size={16} className="text-green-600" /> New Arrivals Daily
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> +201234567890
            </span>
            <span className="flex items-center gap-1.5 hover:text-green-600 cursor-pointer transition-colors">
              <Mail size={14} /> support@eltaranisishopping.com
            </span>

            <div className="flex items-center gap-3 border-l pl-4 border-gray-300">
              {status === "loading" ? (
                <span className="flex items-center gap-1 font-bold text-green-600 animate-pulse">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </span>
              ) : status === "authenticated" ? (
                <div className="flex items-center gap-4 text-gray-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <User size={14} /> {userName}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/Login"
                    className="flex items-center gap-1 font-bold hover:text-green-600 transition-colors"
                  >
                    <User size={14} /> Sign In
                  </Link>
                  <Link
                    href="/Register"
                    className="flex items-center gap-1 font-bold hover:text-green-600 transition-colors"
                  >
                    <UserPlus size={14} /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 lg:py-3.5 flex items-center justify-between gap-4 lg:gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={eltaranisiLogo}
            alt="Eltaranisi Logo"
            width={150}
            height={40}
            priority
            className="w-[130px] h-auto lg:w-[150px] lg:h-10"
          />
        </Link>

        {/* Search — بحث حي 🔍 (ديسكتوب فقط — على الموبايل جوه القائمة) */}
        <div className="hidden lg:flex flex-1 max-w-lg relative items-center">
          <SearchBar />
        </div>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`font-bold transition-colors ${
                path === link.path
                  ? "text-green-600"
                  : "text-gray-800 hover:text-green-600"
              }`}
            >
              {link.element}
            </Link>
          ))}

          {/* Categories — ✅ كل عنصر بيفتح صفحته فعليًا (render prop) */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 font-bold text-gray-800 bg-white outline-none hover:text-green-600 transition-colors cursor-pointer">
              Categories <ChevronDown size={16} strokeWidth={2.5} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52 p-2 bg-white shadow-lg border border-gray-100 z-50 rounded-xl"
            >
              {categoryLinks.map((cat) => (
                <DropdownMenuItem
                  key={cat.href}
                  render={<Link href={cat.href} />}
                  className="cursor-pointer font-bold hover:text-green-600 focus:text-green-600 focus:bg-green-50 text-sm"
                >
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {links.slice(2).map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`font-bold transition-colors ${
                path === link.path
                  ? "text-green-600"
                  : "text-gray-800 hover:text-green-600"
              }`}
            >
              {link.element}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Support — 🆕 Link لصفحة /contact مع hover و pointer */}
          <Link
            href="/contact"
            className="hidden xl:flex items-center gap-3 cursor-pointer group/support"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 transition-all duration-200 group-hover/support:bg-green-100 group-hover/support:scale-105">
              <Headphones size={22} strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-semibold leading-tight transition-colors group-hover/support:text-green-600">
                Support
              </span>
              <span className="text-sm font-bold text-gray-900 leading-tight transition-colors group-hover/support:text-green-600">
                24/7 Help
              </span>
            </div>
          </Link>

          <div className="h-8 w-[1px] bg-gray-200 hidden xl:block" />

          {/* Wishlist + badge بعدد المنتجات (بيظهر في كل المقاسات) */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="text-gray-700 hover:text-green-600 transition-colors relative"
          >
            <Heart size={24} strokeWidth={2} />
            {wishCount > 0 && (
              <span
                key={wishCount}
                style={{ animation: "badgePop .25s ease-out" }}
                className="absolute -top-2 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-md pointer-events-none"
              >
                {wishCount}
              </span>
            )}
          </Link>

          {/* 🛒 Cart + الـ badge اللي فيه عدد المنتجات (بيظهر في كل المقاسات) */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="text-gray-700 hover:text-green-600 transition-colors relative"
          >
            <ShoppingCart size={24} strokeWidth={2} />
            {cartCount > 0 && (
              <span
                key={
                  cartCount
                } /* key عشان الأنيميشن يشتغل مع كل تغيير في العدد */
                style={{ animation: "badgePop .25s ease-out" }}
                className="absolute -top-2 -right-2.5 min-w-[20px] h-5 px-1 rounded-full bg-green-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-md pointer-events-none"
              >
                {cartCount}
              </span>
            )}
            <style>{`@keyframes badgePop { 0% { transform: scale(.4) } 70% { transform: scale(1.15) } 100% { transform: scale(1) } }`}</style>
          </Link>

          {/* User / Auth — ديسكتوب فقط (على الموبايل جوه القائمة) */}
          <div className="hidden lg:flex items-center">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
            ) : status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="User menu"
                  className="text-gray-700 hover:text-green-600 transition-colors outline-none cursor-pointer"
                >
                  <User size={26} strokeWidth={2} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-64 p-3 rounded-2xl bg-white shadow-xl border border-gray-100 z-50 mt-2"
                >
                  <div className="flex items-center gap-3 pb-3 mb-2 border-b border-gray-100">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <User size={22} strokeWidth={2.2} />
                    </div>
                    <span className="font-bold text-gray-800 text-base truncate">
                      {userName}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    {profileLinks.map(({ href, label, Icon, color }) => (
                      <DropdownMenuItem
                        key={
                          label
                        } /* label مش href — في لينكين بنفس الـ href */
                        render={<Link href={href} />}
                        className={`flex items-center w-full gap-3 py-2.5 px-3 rounded-xl text-gray-700 font-semibold cursor-pointer hover:bg-[#c6f7ce98] focus:bg-[#c6f7ce98] text-sm ${color}`}
                      >
                        <Icon size={18} className="text-gray-500" />
                        <span>{label}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>

                  <div className="my-2 border-t border-gray-100" />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 font-semibold cursor-pointer text-sm transition-colors"
                  >
                    <LogOut size={18} className="text-red-500" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/Login"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <User size={18} /> Sign In
              </Link>
            )}
          </div>

          {/* 📱 Hamburger — موبايل/تابلت فقط (الدايرة الخضرا في الصورة 1) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="lg:hidden w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 📱 القائمة الجانبية (Drawer) — الصور 2 و 3 */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        status={status}
        userName={userName}
        cartCount={cartCount}
        wishCount={wishCount}
        onLogout={handleLogout}
      />
    </header>
  );
}

/* ============================== Mobile Menu =============================== */
/* Drawer بيطلع من اليمين — بيظهر تحت lg فقط، فوقها الـ UI القديم زي ما هو
   ⚠️ الـ highlight الأخضر/الأحمر = hover فقط (زي الصور) — مفيش active state */

function MobileMenu({
  open,
  onClose,
  status,
  userName,
  cartCount,
  wishCount,
  onLogout,
}) {
  /* صفوف اللينكات الرئيسية (48px):
     عادي → رمادي غامق | hover → خلفية خضرا فاتحة + نص أخضر */
  const navRow =
    "flex items-center w-full rounded-xl px-4 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200";

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/50 transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Panel */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        onClick={(e) => {
          /* أي لينك جوه القائمة (حتى نتائج البحث) → تتقفل لوحدها */
          if (e.target.closest?.("a")) onClose();
        }}
        className={`fixed inset-y-0 right-0 z-[70] w-[320px] max-w-[88vw] bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          open ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
      >
        {/* ------------------- Header: Logo + X (خلفية رمادي فاتح) ------------------- */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-50/60 border-b border-gray-100 shrink-0">
          <Link href="/" className="flex items-center">
            <Image
              src={eltaranisiLogo}
              alt="Eltaranisi Logo"
              width={150}
              height={40}
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* ------------------------------ Scroll body ------------------------------ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="min-h-full flex flex-col px-4 pt-5 pb-4">
            {/* Search — نفس كومبوننت البحث الحي بتاع الديسكتوب */}
            <div className="relative flex items-center w-full">
              <SearchBar />
            </div>

            <div className="my-4 border-t border-gray-100" />

            {/* Links — Home / Shop / Categories / Brands (كلهم لينكات عادية زي الصورة) */}
            <nav className="space-y-1">
              {links.slice(0, 2).map((link) => (
                <Link key={link.path} href={link.path} className={navRow}>
                  {link.element}
                </Link>
              ))}
              <Link href="/categories" className={navRow}>
                Categories
              </Link>
              {links.slice(2).map((link) => (
                <Link key={link.path} href={link.path} className={navRow}>
                  {link.element}
                </Link>
              ))}
            </nav>

            <div className="my-4 border-t border-gray-100" />

            {/* Wishlist / Cart */}
            <div className="space-y-1">
              <DrawerRow
                href="/wishlist"
                Icon={Heart}
                iconClass="bg-red-50 text-red-500"
                label="Wishlist"
                count={wishCount}
                countClass="bg-red-500"
              />
              <DrawerRow
                href="/cart"
                Icon={ShoppingCart}
                iconClass="bg-green-50 text-green-600"
                label="Cart"
                count={cartCount}
                countClass="bg-green-600"
              />
            </div>

            <div className="my-4 border-t border-gray-100" />

            {/* Account */}
            {status === "loading" ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
              </div>
            ) : status === "authenticated" ? (
              <div className="space-y-1">
                {/* اسم المستخدم → صفحة البروفايل */}
                <DrawerRow
                  href="/profile/addresses"
                  Icon={User}
                  iconClass="bg-gray-100 text-gray-500"
                  label={userName}
                />
                {/* Settings → /profile/settings */}
                <DrawerRow
                  href="/profile/settings"
                  Icon={Settings}
                  iconClass="bg-gray-100 text-gray-500"
                  label="Settings"
                />
                {/* Sign Out: أحمر — hover خلفية حمرا فاتحة */}
                <DrawerRow
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  Icon={LogOut}
                  iconClass="bg-red-50 text-red-500"
                  label="Sign Out"
                  variant="danger"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <DrawerRow
                  href="/Login"
                  Icon={User}
                  iconClass="bg-green-50 text-green-600"
                  label="Sign In"
                />
                <DrawerRow
                  href="/Register"
                  Icon={UserPlus}
                  iconClass="bg-gray-100 text-gray-500"
                  label="Sign Up"
                />
              </div>
            )}

            {/* Need Help — كارت رمادي فاتح في آخر القائمة */}
            <Link href="/contact" className="mt-auto pt-6 block">
              <div className="rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors duration-200 p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                  <Headphones size={20} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    Need Help?
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-green-600 leading-tight">
                    Contact Support
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* صف بأيقونة في دايرة ملوّنة (60px)
   variant="default" → hover: خلفية خضرا فاتحة + النص أخضر (Wishlist / Cart / Ahmed / Sign In / Sign Up)
   variant="danger"  → hover: خلفية حمرا فاتحة والنص يفضل أحمر (Sign Out)
   الأيقونة ودايرتها ألوانهم ثابتة ومش بتتغير مع الـ hover (زي الصور) */
function DrawerRow({
  href,
  onClick,
  Icon,
  iconClass,
  label,
  count,
  countClass = "bg-green-600",
  variant = "default",
}) {
  const className = `flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left transition-colors duration-200 cursor-pointer ${
    variant === "danger"
      ? "text-red-500 hover:bg-red-50"
      : "text-gray-700 hover:bg-green-50 hover:text-green-600"
  }`;

  const content = (
    <>
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
      {/* من غير لون خاص — بياخد لون الصف عشان يتغيّر مع الـ hover */}
      <span className="flex-1 min-w-0 truncate text-base font-medium">
        {label}
      </span>
      {count != null && count > 0 && (
        <span
          className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-white text-[11px] font-bold flex items-center justify-center ${countClass}`}
        >
          {count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
