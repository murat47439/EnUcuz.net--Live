import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/authContext";
import { ToastProvider } from "@/context/toastContext";
import ModalProvider from "@/context/modalContext";
import Header from "@/features/components/header";
import Footer from "@/features/components/footer";
import ChatWidget from "@/features/components/chat-widget";
import Script from "next/script";
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
  title: "2pazar | Senin İkinci Pazarın",
  description: "2pazar - Türkiye'nin en iyi 2. el ürün platformu. Binlerce ilan arasından aradığınızı bulun veya ürünlerinizi kolayca satışa çıkarın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#fafafa]`}
      >
        <AuthProvider>
          <ToastProvider>
            <ModalProvider>
              <Header></Header>
              <main className="pt-[116px] sm:pt-[106px] lg:pt-[106px] min-h-screen">{children}</main>
              <Script
                src="https://static.sumsub.com/idensic/static/sns-websdk-builder.js"
                strategy="afterInteractive"

              />
              <Footer></Footer>
              <ChatWidget />
            </ModalProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
