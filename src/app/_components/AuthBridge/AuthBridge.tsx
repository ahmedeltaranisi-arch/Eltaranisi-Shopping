"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuthToken } from "@/app/_apis/profile.api";

// بيمرر التوكن من NextAuth session للـ API layer
export default function AuthBridge() {
  const { data: session } = useSession();
  useEffect(() => {
    const s = session as { token?: string; user?: { token?: string } } | null;
    setAuthToken(s?.token ?? s?.user?.token ?? null);
  }, [session]);
  return null;
}
