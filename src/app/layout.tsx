import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Relvion AI — Intelligent Email & Calendar Workspace",
  description: "Relvion AI unifies email, calendar, and a dedicated AI agent into one focused workspace.",
  icons: {
    icon: [
      {
        url: "/brand/icon-light.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/brand/icon-dark.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/brand/apple-icon.svg",
    shortcut: "/brand/icon-dark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} antialiased dark`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
