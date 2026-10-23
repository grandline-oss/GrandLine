import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import FirebaseSyncProvider from '@/components/FirebaseSyncProvider';
import CookieBanner from '@/components/public/CookieBanner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://grand-line-red.vercel.app'),
  title: 'GRAND LINE CAFÉ & RESTAURANT | Your Journey Begins Here',
  description:
    'Official website of GRAND LINE CAFÉ & RESTAURANT. Your Journey Begins Here. Browse our menu to discover the items and prices currently offered.',
  keywords: [
    'GRAND LINE',
    'Grand Line Cafe',
    'Grand Line Restaurant',
    'restaurant',
    'cafe',
    'food',
    'beverages',
    'menu',
  ],
  icons: {
    icon: '/brand/grand-line-logo.jpg',
    shortcut: '/brand/grand-line-logo.jpg',
    apple: '/brand/grand-line-logo.jpg',
  },
  openGraph: {
    title: 'GRAND LINE CAFÉ & RESTAURANT',
    description: 'Official website of GRAND LINE CAFÉ & RESTAURANT. Your Journey Begins Here.',
    type: 'website',
    images: [
      {
        url: '/brand/og-image.jpg',
        width: 1024,
        height: 1024,
        alt: 'GRAND LINE CAFÉ & RESTAURANT',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#faf8f5] text-[#1c1917]">
        <AuthProvider>
          <FirebaseSyncProvider>
            {children}
            <CookieBanner />
          </FirebaseSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
