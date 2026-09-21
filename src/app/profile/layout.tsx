import Link from "next/link";
import { User } from "lucide-react";
import ProfileSidebar from "@/app/_components/ProfileSidebar/ProfileSidebar";

const fontStyle = {
  fontFamily: "var(--font-exo), 'Exo', 'Exo Fallback', sans-serif",
};

// Layout مشترك للصفحتين: الهيدر الأخضر (نفس ستايل صفحة Contact) + السايدبار
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F7F5]" style={fontStyle}>
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-br from-[#009B4D] via-[#1FB85A] to-[#38C25B] text-white py-8 px-4">
        <div className="container mx-auto px-3">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold mb-5">
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
            <span className="text-white/60">/</span>
            <span className="font-bold">My Account</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                My Account
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#A3EDC0]">
                Manage your addresses and account settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
          <ProfileSidebar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
