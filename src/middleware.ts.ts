import { NextRequest, NextResponse } from "next/server";
// 🔵 [إضافة جديدة] استدعاء دالة getToken ضروري جداً لكي يعمل الكود
import { getToken } from "next-auth/jwt";

// 🔴 [تصحيح] تم تغيير اسم الدالة من proxy إلى middleware ليتعرف عليها Next.js
export async function proxy(req: NextRequest) {
  //page protect
  // 🟢 [تحسين] تم توحيد أسماء المتغيرات لتجنب الأخطاء الإملائية
  const protectedPages = ["/brands", "/Cart", "/wishList"];
  const authPages = ["/Login", "/Register"];

  // get path
  // 🟢 [تحسين] جعلنا حرف P صغيراً pathName ليتطابق مع الاستخدام في الأسفل
  const pathName = req.nextUrl.pathname;

  // get Token => get Token
  // 🔵 [ملاحظة] تأكد أن NEXTAUTH_SECRET موجود في ملف .env الخاص بك
  const myToken = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const accessToken = myToken?.token;

  // 🔴 [تصحيح حرج] تم إصلاح أقواس الـ if وتصحيح كلمة starsWith إلى startsWith
  if (
    !accessToken &&
    protectedPages.some((path) => pathName.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/Login", req.nextUrl));
  }

  // 🔴 [تصحيح منطقي] تم تغيير protectedPages إلى authPages حتى لا يطرد المستخدم من الصفحات المحمية
  if (accessToken && authPages.some((path) => pathName.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 🔴 [تصحيح] الدالة next تحتاج إلى أقواس () في النهاية لتنفيذها
  return NextResponse.next();
}

// cart/id/test/
// 🔵 [تصحيح هيكلي] وضعنا جميع المسارات في مصفوفة (Array) واحدة بدلاً من تكرار كلمة matcher
export const config = {
  matcher: [
    "/Cart/:path*",
    "/wishlist/:path*",
    "/Login/:path*",
    "/Register/:path*",
    "/brands/:path*", // 🟢 [إضافة] تم إضافة مسار الـ brands لتشمله الحماية
  ],
};
