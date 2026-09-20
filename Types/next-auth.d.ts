//------------CODE AI ------------------------------------
// import type { DefaultSession } from "next-auth";
// import type { JWT } from "next-auth/jwt";

// // 1. إضافة الخصائص الجديدة لواجهة User و Session
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       token?: string;
//     } & DefaultSession["user"];
//   }

//   interface User {
//     id: string;
//     token: string;
//   }
// }

// // 2. إضافة الخصائص الجديدة لواجهة JWT
// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     token: string;
//   }
// }

//---------------------------------------------------------------------//

import NextAuth , {User} from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User {
    token : string

  }
  interface Session {
    user: {
      name: string;
      email: string;
      id: string;
      token: string; // 👈 أضفنا التوكن هنا ليتعرف عليه NextAuth في الجلسة

      /** The user's postal address. */
      address?: string;
    };
  }

}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends User {
    /** OpenID ID Token */
    idToken?: string;
  }
}
