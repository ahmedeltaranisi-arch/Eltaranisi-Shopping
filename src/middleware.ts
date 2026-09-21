import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = [
  "/cart",
  "/wishlist",
  "/checkout",
  "/orders",
  "/profile",
  "/brands",
];
const authPaths = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const pathName = req.nextUrl.pathname.toLowerCase();

  const myToken = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const accessToken = myToken?.token;

  if (
    !accessToken &&
    protectedPaths.some((path) => pathName.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/Login", req.nextUrl));
  }
  if (accessToken && authPaths.some((path) => pathName.startsWith(path))) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Cart/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/wishList/:path*",
    "/Login/:path*",
    "/Register/:path*",
    "/brands/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
  ],
};
