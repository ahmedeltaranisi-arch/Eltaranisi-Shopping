import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function getTokenFun() {
  const cookieStore = await cookies();
  const nextAuthToken =
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value;

  if (!nextAuthToken) return null;

  const accessToken = await decode({
    secret: process.env.NEXTAUTH_SECRET!,
    token: nextAuthToken,
  });
  return accessToken?.token;
}
