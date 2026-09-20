// app/components/AOSProvider.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import "aos/dist/aos.css";

// الصفحات اللي الأنيميشن ملغي فيها تمامًا (على كل الشاشات)
const NO_AOS_ROUTES = ["/Login", "/Register"];

// أقل عرض شاشة هيشتغل عليه الأنيميشن (أقل منه = موبايل/تابلت = يتوقف)
const AOS_MIN_WIDTH = 1024;

export default function AOSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noAos = NO_AOS_ROUTES.includes(pathname);

  // تهيئة AOS مرة واحدة عند فتح الموقع
  useEffect(() => {
    AOS.init({
      duration: 1400,
      once: true,
      easing: "ease-out-cubic",
      disable: () => window.innerWidth < AOS_MIN_WIDTH,
    });
  }, []);

  // مع كل انتقال بين الصفحات: إعادة فحص عناصر الأنيميشن الجديدة
  useEffect(() => {
    AOS.refreshHard();
  }, [pathname]);

  if (noAos) {
    return <div className="no-aos">{children}</div>;
  }

  return <>{children}</>;
}