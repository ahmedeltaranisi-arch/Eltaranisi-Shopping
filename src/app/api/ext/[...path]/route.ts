import { NextRequest, NextResponse } from "next/server";
import { getTokenFun } from "@/lib/server-token";
import { API_ORIGIN } from "@/lib/api";

/**
 * بروكسي آمن للـ API الخارجي (RouteMisr).
 * - التوكن بيتحط على السيرفر (من NextAuth session) ومش بيوصل للبراوزر.
 * - مسموح بالمسارات اللي بتبدأ بـ v1/ أو v2/ بس (مش open proxy).
 */

const ALLOWED_PATH = /^(v1|v2)\/[A-Za-z0-9/_.-]+$/;

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = (path ?? []).join("/");

  if (!ALLOWED_PATH.test(joined)) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const token = await getTokenFun();
  const url = `${API_ORIGIN}/api/${joined}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.token = token;

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: body || undefined,
      cache: "no-store",
    });

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "تعذر الاتصال بالخادم — حاول مرة أخرى" },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
