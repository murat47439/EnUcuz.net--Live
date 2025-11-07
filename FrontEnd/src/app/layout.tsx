import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/authContext";
import { ToastProvider } from "@/context/toastContext";
import Header from "@/features/components/header";
import Footer from "@/features/components/footer";
import "./globals.css";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnUcuz-Net",
  description: "2. El Ürün Sitesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-slate-50 via-white to-slate-50`}
      >
        <AuthProvider>
        <ToastProvider>
        <Header></Header>
        {/* Decorative background glows */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-10 -left-10 h-64 w-64 bg-blue-300/30 blur-3xl rounded-full"></div>
          <div className="absolute top-1/3 -right-10 h-72 w-72 bg-indigo-300/20 blur-3xl rounded-full"></div>
        </div>

          <main className="pt-28 min-h-screen">{children}</main>

        <Footer></Footer>
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
