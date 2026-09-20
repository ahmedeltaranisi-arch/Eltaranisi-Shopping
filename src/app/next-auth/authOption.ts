import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

export const authOptions: NextAuthOptions = {
  // 👈 إضافة الـ secret هنا ضرورية جداً للعمل على Vercel بدون أخطاء
  secret: process.env.NEXTAUTH_SECRET,

  // 1. تأكيد حفظ الجلسة في الكوكيز
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "My Login",

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
          console.log("API env:", process.env.API);
          const res = await fetch(`${process.env.API}auth/signin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const payload = await res.json();

          if (!res.ok) {
            console.log("RouteMisr Error Message:", payload.message);
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
      console.log("🟢 JWT Callback - User exists?", !!user);

      if (user) {
        console.log("✅ لحظة تسجيل الدخول: تم حفظ البيانات في التوكن");
        token.id = user.id;
        token.token = user.token;
      }

      console.log("🟡 محتوى التوكن الحالي:", token);
      return token;
    },

    async session({ session, token }) {
      console.log("🟢 Session Callback Triggered");

      if (token) {
        if (!session.user) {
          session.user = { name: "", email: "", id: "", token: "" };
        }
        session.user.id = token.id as string;
        session.user.token = token.token as string;
      }

      console.log("🔵 الجلسة النهائية التي تذهب للمتصفح:", session);
      return session;
    },
  },

  // تحديد الصفحة الخاصة بتسجيل الدخول
  pages: {
    signIn: "/login",
  },
};
