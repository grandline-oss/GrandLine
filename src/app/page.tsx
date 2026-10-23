'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import HeroSection from '@/components/public/HeroSection';
import FeaturedCarousel from '@/components/public/FeaturedCarousel';
import { getSettings, getMenuItems } from '@/lib/storage';
import { RestaurantSettings, MenuItem } from '@/lib/types';
import { Utensils, Flame, Leaf, Clock, MapPin, ArrowRight, Phone } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection settings={settings} />

        {/* Featured Food Carousel / Grid */}
        <FeaturedCarousel items={menuItems} />

        {/* Restaurant Introduction & Story Section */}
        <section className="py-20 bg-stone-900 text-stone-100 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-2">
                  Our Culinary Philosophy
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
                  Crafting Timeless Flavors, Rooted in Tradition
                </h2>
                <div className="space-y-4 text-stone-300 text-sm sm:text-base leading-relaxed">
                  <p>{settings.story}</p>
                  <p>{settings.philosophy}</p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all active:scale-95 shadow-md shadow-amber-950/40"
                  >
                    <span>Read Our Full Story</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-sm border border-stone-700 transition-all"
                  >
                    <span>Reserve a Table</span>
                  </Link>
                </div>
              </div>

              {/* Visual Showcase Collage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-800">
                    <img
                      src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                      alt="Artisanal cooking"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 text-center">
                    <span className="font-serif text-2xl font-bold text-amber-400 block">100%</span>
                    <span className="text-xs text-stone-300">Fresh Local Produce</span>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 text-center">
                    <span className="font-serif text-2xl font-bold text-amber-400 block">Stone-Ground</span>
                    <span className="text-xs text-stone-300">House-Blended Spices</span>
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-stone-800">
                    <img
                      src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                      alt="Restaurant atmosphere"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Highlights / Core Values */}
        <section className="py-20 bg-white border-y border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-2">
                What Sets Us Apart
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                An Authentic Gastronomic Experience
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                  Clay Oven & Wood-Fire
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Traditional tandoors and slow-simmered handis infuse every kebab and curry with authentic charcoal aroma and velvety richness.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                  Zero Artificial Additives
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  We prepare every sauce, marinade, and stock from scratch. No artificial colorings or shortcuts—just pure, honest ingredients.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-6">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">
                  Coastal Heritage Recipes
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Time-honored marinades featuring stone-ground Malabar pepper, hand-pressed coconut milk, and seasonal fresh coastal catches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visit & Hours Strip */}
        <section className="py-16 bg-[#faf8f5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block">
                  Join Us for Lunch or Dinner
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  Experience {settings.name}
                </h3>
                <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                  Whether you are planning a relaxed family feast, an intimate evening, or a celebratory gathering, our doors are open to welcome you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs sm:text-sm text-stone-300">
                  {settings.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{settings.openingHours}</span>
                    </div>
                  )}
                  {settings.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
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
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
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
