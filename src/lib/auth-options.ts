import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import { API_V1, serverFetch } from "@/lib/api";

type SigninPayload = {
  message?: string;
  token?: string;
  user?: { email: string; name: string };
};

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
          const payload = await serverFetch<SigninPayload>(`${API_V1}/auth/signin`, {
            method: "POST",
            body: {
              email: credentials?.email,
              password: credentials?.password,
            },
          });

          if (payload.message === "success" && payload.token && payload.user) {
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
          session.user = {
            name: "",
            email: "",
            id: "",
            token: "",
          };
        }
        session.user.id = (token.id as string) ?? "";
        session.user.token = (token.token as string) ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/Login",
  },
};
