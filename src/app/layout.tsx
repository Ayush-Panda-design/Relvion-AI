import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Relvion AI — Your Intelligent Email Client",
  description: "Superhuman-style email and calendar client powered by Corsair + Gemini AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} antialiased dark`}>
      <body className="flex flex-col bg-[#FFF9C4] text-red-900 min-h-screen">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
