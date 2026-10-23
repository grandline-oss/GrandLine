import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'GrandLine Fine Dine & Cafe | Artisanal Coastal & Indian Cuisine',
  description:
    'Experience handcrafted regional dishes, fresh coastal seafood, clay-oven tandoor specialties, and artisan coolers in an inviting fine-dining ambiance.',
  keywords: ['restaurant', 'fine dine', 'coastal seafood', 'biryani', 'tandoori', 'kochi dining', 'food menu'],
  openGraph: {
    title: 'GrandLine Fine Dine & Cafe',
    description: 'Artisanal Flavors & Authentic Hospitality',
    type: 'website',
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
