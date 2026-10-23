'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import FeaturedCarousel from '@/components/public/FeaturedCarousel';
import { getSettings, getMenuItems } from '@/lib/storage';
import { RestaurantSettings, MenuItem } from '@/lib/types';
import { Clock, MapPin, ArrowRight, Phone } from 'lucide-react';

export default function HomePage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setSettings(getSettings());
    setMenuItems(getMenuItems());
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 text-stone-200">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#121214] text-[#1c1917] dark:text-[#f4f4f5] transition-colors duration-200">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection settings={settings} />

        {/* Featured Food Carousel / Grid */}
        <FeaturedCarousel items={menuItems} />

        {/* Restaurant Introduction & Story Section (Rendered only when story is supplied) */}
        {settings.story && (
          <section className="py-20 bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-y border-stone-200 dark:border-stone-800 relative overflow-hidden transition-colors">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold block mb-2">
                About Us
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-white mb-6 leading-tight">
                {settings.name}
              </h2>
              <div className="space-y-4 text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
                <p>{settings.story}</p>
                {settings.philosophy && <p>{settings.philosophy}</p>}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all active:scale-95 shadow-md shadow-amber-950/40"
                >
                  <span>About Us</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm border border-stone-300 dark:border-stone-700 transition-all"
                >
                  <span>Contact Information</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Visit & Contact Strip */}
        <section className="py-16 bg-[#faf8f5] dark:bg-[#121214] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white rounded-3xl p-8 sm:p-12 shadow-md dark:shadow-xl border border-stone-200 dark:border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-8 transition-colors">
              <div className="space-y-4 max-w-xl">
                <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold block">
                  Visit & Inquiries
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                  {settings.name}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
                  Browse our menu to explore the items and prices currently offered, or reach out to us directly for any inquiries.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                  {settings.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{settings.openingHours}</span>
                    </div>
                  )}
                  {settings.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{settings.address.split(',')[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm text-center shadow-lg transition-all active:scale-95"
                >
                  View Full Menu
                </Link>
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-medium text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Call {settings.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
