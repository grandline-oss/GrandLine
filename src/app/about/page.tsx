'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';
import { ArrowRight, MapPin, Clock, Phone, BookOpen } from 'lucide-react';

export default function AboutPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const restaurantName = settings?.name || 'GRAND LINE CAFÉ & RESTAURANT';

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-stone-900 text-white py-16 sm:py-24 border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-3">
              ABOUT US
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              About {restaurantName}
            </h1>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed font-light">
              {settings?.tagline || 'YOUR JOURNEY BEGINS HERE'}
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-stone-200/90 shadow-xs space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-2">
                Our Restaurant
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Welcome to {restaurantName}
              </h2>
            </div>

            <div className="space-y-5 text-stone-600 text-base sm:text-lg leading-relaxed border-t border-stone-100 pt-6">
              {settings?.story ? (
                <p className="text-stone-700">{settings.story}</p>
              ) : (
                <p>
                  Welcome to {restaurantName}. We are dedicated to providing our guests with a welcoming dining environment and a variety of food and beverage options.
                </p>
              )}

              {settings?.philosophy ? (
                <p className="text-stone-700">{settings.philosophy}</p>
              ) : (
                <p className="text-stone-600 text-base">
                  Discover the food and beverages available on our menu, or visit our location to dine with us.
                </p>
              )}
            </div>

            {/* Quick Action Navigation */}
            <div className="pt-4 flex flex-wrap items-center gap-4 border-t border-stone-100">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Our Menu</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-sm transition-all active:scale-95"
              >
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>Find Us & Contact</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact & Hours Information (Only when provided) */}
        {(settings?.address || settings?.openingHours || settings?.phone) && (
          <section className="pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings?.address && (
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-1">Location</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{settings.address}</p>
                </div>
              )}

              {settings?.openingHours && (
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-1">Opening Hours</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{settings.openingHours}</p>
                </div>
              )}

              {settings?.phone && (
                <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-1">Phone</h3>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="text-xs sm:text-sm text-stone-600 hover:text-amber-700 leading-relaxed block"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom Menu Invitation Strip */}
        <section className="py-16 bg-stone-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Explore What We Offer
            </h3>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Browse our menu to explore the items and prices currently offered at {restaurantName}.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
              >
                <span>View Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
