import React from "react";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
// ⚠️ lucide-react v1.0 شالت أيقونات البراندات (Facebook/Twitter/Instagram/YouTube)
// خالص من المكتبة، فبنجيبهم من react-icons بدالها — باقي الأيقونات فوق لسه من lucide عادي.
import {
  FaFacebook,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";
import eltaranisiLogo from "@/assets/images/Eltaranisi.png";
import Image from "next/image";
import { getCategories } from "@/services/categories";

/**
 * Footer — كل الروابط اشتغلت بمسارات حقيقية موجودة في المشروع:
 * - Link للروابط الداخلية فقط (قاعدة: Link = داخلي، <a> = خارجي)
 * - أيقونات السوشيال بقت <a href="رابط فعلي" target="_blank"> بدل href="#"
 * - ملاحظة حساسية الأحرف: المسار الصحيح /Login و /Register بحرف كبير
 *   زي ما هو ثابت في الـ Navbar — /signin و /register كانوا هيرجعوا 404
 * - التصنيفات السريعة (Electronics / Men's / Women's) بتودّي على
 *   صفحة /categories/{id} بنفس الـ IDs الحقيقية من الـ API
 * - الصفحات اللي لسه متعملتش (Help / Shipping / Returns / Legal...)
 *   متحوّلة على أقرب صفحة موجودة (معظمها /contact) لحد ما تتعمل —
 *   معلّمين بـ 🔜 عند كل واحد
 */
export default async function Footer() {
  // 🔗 التصنيفات السريعة — IDs حقيقية من GET /api/v1/categories (كـ fallback)
  const fallbackCategories = {
    electronics: "6439d2d167d9aa4ca970649f",
    mensFashion: "6439d5b90049ad0b52b90048",
    womensFashion: "6439d58a0049ad0b52b9003f",
  };
  let categoryLinks = [
    { label: "Electronics", href: `/categories/${fallbackCategories.electronics}` },
    { label: "Men's Fashion", href: `/categories/${fallbackCategories.mensFashion}` },
    { label: "Women's Fashion", href: `/categories/${fallbackCategories.womensFashion}` },
  ];
  // الأفضل: التصنيفات تيجي ديناميك من الـ API — والفallback لو الـ API وقع
  try {
    const cats = await getCategories();
    if (cats.length > 0) {
      categoryLinks = cats
        .slice(0, 3)
        .map((c) => ({ label: c.name, href: `/categories/${c._id}` }));
    }
  } catch {
    /* الـ API وقع — نفضل على اللينكات الثابتة */
  }

  const featureBanner = [
    {
      Icon: Truck,
      title: "Free Shipping",
      text: "On orders over 500 EGP",
      href: "/products", // المنتجات كلها فيها شحن مجاني
    },
    {
      Icon: RotateCcw,
      title: "Easy Returns",
      text: "14-day return policy",
      href: "/contact", // 🔜 لما تعمل /returns بدّلها
    },
    {
      Icon: ShieldCheck,
      title: "Secure Payment",
      text: "100% secure checkout",
      href: "/cart", // أقرب حاجة لرحلة الدفع
    },
    {
      Icon: Headphones,
      title: "24/7 Support",
      text: "Contact us anytime",
      href: "/contact",
    },
  ];

  const shopLinks = [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Brands", href: "/brands" },
    ...categoryLinks,
  ];

  const accountLinks = [
    { label: "My Account", href: "/profile/settings" }, // 🔜 مفيش /account —حوّلنا على اللوجين
    { label: "Order History", href: "/orders" }, // 🔜 لما تعمل /orders بدّلها
    { label: "Wishlist", href: "/wishlist" },
    { label: "Shopping Cart", href: "/cart" },
    { label: "Sign In", href: "/Login" }, // ⚠️ حرف كبير زي الـ Navbar
    { label: "Create Account", href: "/Register" }, // ⚠️ حرف كبير
  ];

  const supportLinks = [
    { label: "Contact Us", href: "/contact" },
    { label: "Help Center", href: "/contact" }, // 🔜 لما تعمل /help بدّلها
    { label: "Shipping Info", href: "/contact" }, // 🔜 لما تعمل /shipping بدّلها
    { label: "Returns & Refunds", href: "/contact" }, // 🔜 لما تعمل /returns بدّلها
    { label: "Track Order", href: "/orders" }, // 🔜 لما تعمل /orders بدّلها
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/contact" }, // 🔜 لما تعمل /privacy بدّلها
    { label: "Terms of Service", href: "/contact" }, // 🔜 لما تعمل /terms بدّلها
    { label: "Cookie Policy", href: "/contact" }, // 🔜 لما تعمل /cookie-policy بدّلها
  ];

  // روابط خارجية — دايمًا <a> مش Link (حط لينكات صفحات البراند الحقيقية مكانهم)
  // بقت أيقونات react-icons بدل الـ SVG path اليدوي
  const socials = [
    { label: "Facebook", href: "https://www.facebook.com", Icon: FaFacebook },
    { label: "Twitter", href: "https://x.com", Icon: FaXTwitter },
    {
      label: "Instagram",
      href: "https://www.instagram.com",
      Icon: FaInstagram,
    },
    { label: "YouTube", href: "https://www.youtube.com", Icon: FaYoutube },
  ];

  return (
    <footer className="w-full bg-[#0d1321] text-gray-300 text-sm">
      {/* ================= TOP FEATURES BANNER ================= */}
      <div className="bg-[#e8f8f0] text-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featureBanner.map(({ Icon, title, text, href }) => (
            <Link
              key={title}
              href={href}
              className="flex items-center gap-4 cursor-pointer group/feature"
            >
              <div className="w-12 h-12 rounded-full bg-[#c7f0db] flex items-center justify-center shrink-0 transition-all duration-200 group-hover/feature:scale-105">
                <Icon className="w-6 h-6 text-[#008a5e]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base transition-colors group-hover/feature:text-[#008a5e]">
                  {title}
                </h4>
                <p className="text-xs text-gray-600">{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ================= MAIN FOOTER CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand & Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl"
            >
              <Image
                src={eltaranisiLogo} // تمرير المتغير المستورد مباشرة بدون أي أقواس تنصيص
                alt="Eltaranisi Logo"
                width={150}
                height={150}
                priority
              />
            </Link>

            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Eltaranisi Shopping is your one-stop destination for quality products. From
              fashion to electronics, we bring you the best brands at
              competitive prices with a seamless shopping experience.
            </p>

            {/* Contact Details */}
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#008a5e]" />
                <span>+201234567890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#008a5e]" />
                <span>support@eltaranisishopping.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#008a5e]" />
                <span>Kassasin El-Azhar, Awlad Saqr, Sharqia, Egypt</span>
              </div>
            </div>

            {/* Social Links — react-icons بدل الـ SVG المخصص — روابط خارجية <a> عادي مش Link */}
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#008a5e] transition-colors flex items-center justify-center text-gray-300 hover:text-white"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Shop</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              {shopLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Account */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Account</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              {accountLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Support</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Legal</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-400">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ================= COPYRIGHT & PAYMENTS ================= */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <Link
            href="/"
            className="hover:text-white transition-colors cursor-pointer"
          >
            © 2026 Eltaranisi Shopping. All rights reserved.
          </Link>

          <div className="flex items-center gap-6 ">
            <span className="flex items-center gap-1.5 text-gray-300 hover:text-[#008236] transition-colors duration-200 ease-in-out cursor-pointer">
              <CreditCard className="w-4 h-4 " /> Visa
            </span>
            <span className="flex items-center gap-1.5 text-gray-300 hover:text-[#008236] transition-colors duration-200 ease-in-out cursor-pointer">
              <CreditCard className="w-4 h-4" /> Mastercard
            </span>
            <span className="flex items-center gap-1.5 text-gray-300 hover:text-[#008236] transition-colors duration-200 ease-in-out cursor-pointer">
              <CreditCard className="w-4 h-4" /> PayPal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
