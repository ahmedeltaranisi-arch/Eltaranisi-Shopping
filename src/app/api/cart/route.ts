import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { API_V1, API_V2, serverFetch } from "@/lib/api";

/**
 * GET /api/cart — قراءة السلة الخاصة بالمستخدم الحالي.
 * بنجرب v1 الأول؛ لو فاضية جرب v2 (النسختين ممكن يرجعوا أشكال مختلفة).
 */
export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.token) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const userToken = token.token as string;

  try {
    const v1 = await serverFetch<Record<string, unknown>>(`${API_V1}/cart`, {
      token: userToken,
    });

    if (hasItems(v1)) return NextResponse.json(v1);

    // v1 فاضية؟ جرب v2 (لو رجعت عناصر استخدمها، وإلا رجّع v1 زي ما هي)
    try {
      const v2 = await serverFetch<Record<string, unknown>>(`${API_V2}/cart`, {
        token: userToken,
      });
      if (hasItems(v2)) return NextResponse.json(v2);
    } catch {
      /* v2 مش متاح — عادي */
    }

    return NextResponse.json(v1);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message =
      status === 401
        ? "unauthorized"
        : (error as Error).message || "Internal Server Error";
    return NextResponse.json({ message }, { status });
  }
}

function hasItems(payload: Record<string, unknown>): boolean {
  const data = payload?.data as Record<string, unknown> | undefined;
  const products = (data?.products ?? payload?.products) as unknown[] | undefined;
  const items = (data?.items ?? payload?.items) as unknown[] | undefined;
  return (products?.length ?? 0) > 0 || (items?.length ?? 0) > 0;
}
