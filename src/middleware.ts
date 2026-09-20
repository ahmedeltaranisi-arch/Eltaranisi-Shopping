import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const protectedPages = [
    "/brands",
    "/Cart",
    "/cart",
    "/wishlist",
    "/wishList",
    "/checkout",
    "/orders",
    "/profile",
  ];
  const authPages = ["/Login", "/Register"];
  const pathName = req.nextUrl.pathname;

  const myToken = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const accessToken = myToken?.token;

  if (
    !accessToken &&
    protectedPages.some((path) => pathName.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/Login", req.nextUrl));
  }
  if (accessToken && authPages.some((path) => pathName.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Cart/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/Login/:path*",
    "/Register/:path*",
    "/brands/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
  ],
};
