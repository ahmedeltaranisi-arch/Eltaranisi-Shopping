import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "enter your password",
        },
      },
      async authorize(credentials) {
        try {
          const apiBase =
            process.env.API || "https://ecommerce.routemisr.com/api/v1/";
          const baseUrl = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;

          const res = await fetch(`${baseUrl}auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const payload = await res.json();

          if (!res.ok) {
            console.log("RouteMisr Error:", payload.message);
            return null;
          }

          if (payload.message === "success" && payload.token) {
            const userData: { id: string } = jwtDecode(payload.token);
            return {
              id: userData.id,
              email: payload.user.email,
              name: payload.user.name,
              token: payload.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (!session.user) {
          session.user = { name: "", email: "", id: "", token: "" } as any;
        }
        session.user.id = token.id as string;
        session.user.token = token.token as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login",
  },
};
