import type { Metadata } from "next";
import { Exo } from "next/font/google";
import "./globals.css";
import Navbar from "./_components/Navbar/Navbar";
// 1. استدعي مكتبة التوستر هنا
import { Toaster } from "react-hot-toast";
import MyProvider from "./_components/Provider/MyProvider";
import AOSProvider from "./AOS/AOSProvider";
import Footer from '../Footer/page';
import Providers from "./_components/TanStackProvider/TanStackProvider";
// استدعاء مزود AOS الذي قمنا بإنشائه

const exo = Exo({
  subsets: ["latin"],
  variable: "--font-exo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eltaranisi Shopping",
  description: "Website Shoping",
  icons: {
    icon: "/cart.svg", 
    apple: "/apple-icon.png", 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${exo.variable} h-full antialiased`}>
      <body
        suppressHydrationWarning={true}
        className={`${exo.className} font-sans min-h-full flex flex-col`}
      >
      
        <Providers>
          <MyProvider>
            {/* تم تغليف التطبيق بـ AOSProvider لتعمل الحركات في كل الصفحات */}
            <AOSProvider>
              <Navbar />
              {/* 2. حط التوستر هنا عشان يشتغل على مستوى المشروع كله */}
              <Toaster
                position="top-center"
                reverseOrder={true}
                toastOptions={{
                  // هنا بنحدد المدة بالمللي ثانية (5000 مللي ثانية = 5 ثواني)
                  duration: 5000,
                }}
              />
              {children}
            </AOSProvider>
          </MyProvider>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
