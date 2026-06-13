import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

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
    <html lang="en" className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#FFF9C4] text-red-900 overflow-hidden">
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#FFEE58',
            color: '#f1f5f9',
            border: '1px solid #FBC02D'
          }
        }} />
      </body>
    </html>
  );
}
