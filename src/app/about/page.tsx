'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';
import { Flame, Heart, Sparkles, Utensils, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const restaurantName = settings?.name || 'GrandLine Fine Dine & Cafe';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-stone-900 text-white py-16 sm:py-24 border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-3">
              Our Journey & Heritage
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              The Story of {restaurantName}
            </h1>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-light">
              {settings?.tagline || 'Artisanal Flavors & Authentic Hospitality'}
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 text-stone-700 text-base sm:text-lg leading-relaxed">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
                Tradition Meets Passion
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                Honoring Authentic Recipes with Modern Artistry
              </h2>
              <p className="text-stone-600">
                {settings?.story ||
                  'Founded with an unwavering passion for culinary honesty, GrandLine brings together centuries-old cooking techniques with modern culinary artistry. Every spice blend is ground in-house, and our ingredients are sourced fresh daily from local farmers.'}
              </p>
              <p className="text-stone-600">
                {settings?.philosophy ||
                  'Honest cooking, seasonal freshness, and memorable dining experiences for every guest.'}
              </p>
              <div className="pt-4 flex items-center gap-4">
                <Link
                  href="/menu"
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  Explore Our Menu
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl bg-white border border-stone-300 text-stone-800 font-medium text-sm hover:bg-stone-50 transition-all"
                >
                  Find Our Location
                </Link>
              </div>
            </div>

            {/* Collage Showcase */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                  alt="Restaurant ambiance"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 sm:bottom-6 sm:-left-6 bg-stone-900 text-white p-6 rounded-2xl shadow-xl max-w-xs border border-stone-800 hidden sm:block">
                <span className="font-serif text-3xl font-bold text-amber-400 block mb-1">100%</span>
                <span className="text-xs text-stone-300 leading-snug block">
                  Pure cooking mediums and stone-ground spices prepared every morning.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars / Philosophy Grid */}
        <section className="py-20 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-2">
                Our Core Pillars
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                Crafted with Integrity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Slow-Cooked Dum</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    We seal handis with dough to trap aromatic steam, locking in authentic essences and tenderizing spices over gentle coals.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Genuine Hospitality</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    In our dining room, every guest is treated like family. Courteous staff, warm ambiance, and attention to detail define your visit.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">Fresh Seafood & Meat</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Sourced daily directly from coastal harbors and trusted local butcheries. Never frozen or preserved with chemicals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Invitation Strip */}
        <section className="py-16 bg-[#faf8f5]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
              We Look Forward to Serving You
            </h3>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
              Come savor the aromas, the warm lighting, and the hearty tastes of our kitchen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition-colors"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-500 transition-colors"
              >
                Visit Our Restaurant
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
