import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft, BookOpen, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col justify-between">
      {/* Minimal Top Brand Bar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-stone-950">
            GrandLine
          </span>
        </Link>
        <Link
          href="/menu"
          className="text-xs font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-600"
        >
          View Menu
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
              Error 404 &bull; Page Not Found
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 tracking-tight">
              A Flavor That Vanished
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              The page or culinary specialty you are looking for may have been moved, renamed, or is temporarily off today&apos;s specials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs uppercase tracking-wider border border-stone-200 shadow-2xs transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-600" /> Explore Menu
            </Link>
          </div>

          <p className="text-xs text-stone-400 pt-6 border-t border-stone-200">
            Need reservations or assistance? Reach our host at{' '}
            <a href="mailto:grandlinecaferestaurant@gmail.com" className="text-amber-700 underline font-medium">
              grandlinecaferestaurant@gmail.com
            </a>
          </p>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="py-6 text-center text-xs text-stone-400">
        &copy; 2026 GrandLine Fine Dine & Cafe. All rights reserved.
      </footer>
    </div>
  );
}
