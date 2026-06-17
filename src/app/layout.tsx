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

const themeScript = `(function(){try{var t=localStorage.getItem('relvion-dashboard-theme');var a=localStorage.getItem('relvion-dashboard-appearance');var l=localStorage.getItem('relvion-workspace-theme');if(!t&&l==='dark')t='midnight';if(!t&&l==='light')t='pulse';if(!t)t='midnight';var themes=['midnight','pulse','ocean','crextio','oxfin','limedock'];if(themes.indexOf(t)<0)t='midnight';var ap=a==='dark'?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-appearance',ap);document.documentElement.classList.toggle('dark',ap==='dark');document.documentElement.style.colorScheme=ap;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="midnight" data-appearance="light" className={`${inter.className} antialiased`} suppressHydrationWarning>
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
