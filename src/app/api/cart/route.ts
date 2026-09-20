import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // جلب التوكن من الـ Request
  const token = await getToken({ req });

  // 1. التحقق من وجود التوكن بشكل صحيح
  if (!token) {
    return NextResponse.json(
      { message: "unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 2. جلب البيانات وإضافة cache: 'no-store' لضمان عدم كاشت بيانات السلة الخاصة بالمستخدم
    const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart`, {
      method: "GET",
      headers: {
        token: token.token as string, // استخدام as string لتفادي خطأ TypeScript
        "Content-Type": "application/json",
      },
      cache: "no-store", 
    });

    const payload = await response.json();

    // 3. التعامل مع أخطاء الـ API الخارجي
    if (!response.ok) {
      return NextResponse.json(
        { message: payload.message || "Failed to fetch cart or Unauthorized" },
        { status: response.status }
      );
    }

    console.log(payload);

    // 4. إرجاع الـ payload كـ NextResponse
    return NextResponse.json(payload);

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}