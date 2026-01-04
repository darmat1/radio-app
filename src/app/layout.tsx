import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import I18nProvider from '@/components/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Радио Онлайн',
  description: 'Слушайте радиостанции со всего мира'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#111827'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          suppressHydrationWarning
        />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white overscroll-none`} suppressHydrationWarning>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
