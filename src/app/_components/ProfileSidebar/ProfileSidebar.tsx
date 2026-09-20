"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Settings, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/profile/addresses", label: "My Addresses", Icon: MapPin },
  { href: "/profile/settings", label: "Settings", Icon: Settings },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside
      suppressHydrationWarning
      className="bg-white border border-[#E7E5E1] rounded-xl p-2"
      data-aos="fade-right"
    >
      <h3 className="text-sm font-bold text-[#14171A] px-3 py-3.5 border-b border-[#E7E5E1]">
        My Account
      </h3>

      <nav className="flex flex-col gap-1.5 pt-2.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg border px-2.5 py-2 text-[13px] font-semibold transition-colors ${
                isActive
                  ? "bg-[#E8F8EE] border-[#B9E9CD] text-[#00B250]"
                  : "border-transparent text-[#4B5563] hover:bg-[#F6F7F5]"
              }`}
            >
              <span
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-[#00B250] text-white"
                    : "bg-[#F1F2F4] text-[#8A857B]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              {label}
              <ChevronRight
                className={`w-4 h-4 ms-auto ${
                  isActive ? "text-[#00B250]" : "text-[#C8CCD2]"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
