import { NextResponse } from "next/server";
import { API_V1, serverFetch } from "@/lib/api";

/** GET /api/brands — بوكسي بسيط لقائمة الماركات */
export async function GET() {
  try {
    const payload = await serverFetch<Record<string, unknown>>(
      `${API_V1}/brands?limit=50`,
      { revalidate: 3600 },
    );
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message || "Failed to fetch brands" },
      { status: 502 },
    );
  }
}
