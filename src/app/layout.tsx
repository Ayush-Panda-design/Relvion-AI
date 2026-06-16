import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Relvion AI — Intelligent Email & Calendar Workspace',
  description:
    'Relvion AI unifies email, calendar, and a dedicated AI agent into one focused workspace.',
  icons: {
    icon: [
      {
        url: '/brand/icon-light.svg?v=2',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/brand/icon-dark.svg?v=2',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    apple: '/brand/apple-icon.svg?v=2',
    shortcut: '/brand/icon-dark.svg?v=2',
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('relvion-dashboard-theme');var l=localStorage.getItem('relvion-workspace-theme');if(!t&&l==='dark')t='midnight';if(!t&&l==='light')t='pulse';if(!t)t='midnight';if(['midnight','pulse','ocean','crextio'].indexOf(t)<0)t='midnight';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme='light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="midnight" className={`${inter.className} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
