import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context */
  interface User {
    /** توكن الـ API الخارجي (RouteMisr) — بيتخزن جوه JWT session على السيرفر */
    token: string;
  }

  interface Session {
    user: {
      name: string;
      email: string;
      id: string;
      token: string;
      /** The user's postal address. */
      address?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string;
    token?: string;
    /** OpenID ID Token */
    idToken?: string;
  }
}
