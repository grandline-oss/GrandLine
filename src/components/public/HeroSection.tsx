'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { RestaurantSettings } from '@/lib/types';

interface HeroSectionProps {
  settings: RestaurantSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const rawName = (settings.name || 'GRAND LINE CAFÉ & RESTAURANT').trim();
  let line1 = 'GRAND LINE';
  let line2 = 'CAFÉ & RESTAURANT';

  if (
    rawName.toUpperCase().includes('GRAND LINE') &&
    (rawName.toUpperCase().includes('CAF') || rawName.toUpperCase().includes('REST'))
  ) {
    line1 = 'GRAND LINE';
    const remainder = rawName.replace(/grand\s*line/i, '').trim().replace(/^[-–—:]\s*/, '');
    line2 = remainder || 'CAFÉ & RESTAURANT';
  } else if (rawName.includes('&')) {
    const parts = rawName.split('&');
    line1 = parts[0].trim();
    line2 = `& ${parts.slice(1).join('&').trim()}`;
  } else {
    line1 = rawName;
    line2 = '';
  }

  const heroImage =
    settings.heroImageUrl ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80';

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
      {/* Background Photography with Warm Contrast Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={`${line1} ${line2}`}
          className="w-full h-full object-cover object-center brightness-[0.42] scale-105 animate-in fade-in zoom-in-95 duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-stone-950/40 to-stone-950/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium mb-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="tracking-widest uppercase text-xs">{settings.tagline || 'YOUR JOURNEY BEGINS HERE'}</span>
        </div>

        {/* Primary Restaurant Name: Line 1 = GRAND LINE, Line 2 = CAFÉ & RESTAURANT */}
        <h1 className="font-serif font-extrabold tracking-tight text-white mb-6 leading-none animate-in fade-in slide-in-from-bottom-4 duration-800 flex flex-col items-center">
          <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider uppercase drop-shadow-md text-white">
            {line1}
          </span>
          {line2 && (
            <span className="block text-xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[0.2em] sm:tracking-[0.25em] text-amber-400 font-semibold uppercase mt-2 sm:mt-4 drop-shadow-sm">
              {line2}
            </span>
          )}
        </h1>

        {/* Introduction / Description */}
        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-stone-300 font-light leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-900">
          {settings.description ||
            'Discover the food and beverages available at GRAND LINE CAFÉ & RESTAURANT. Browse our menu to explore the items and prices currently offered.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Link
            href="/menu"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-base shadow-lg shadow-amber-950/50 hover:shadow-amber-600/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Explore Our Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-200 hover:text-white font-medium text-base border border-stone-700 backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Find Us & Contact</span>
          </Link>
        </div>

        {/* Service Details Strip */}
        {(settings.openingHours || settings.address) && (
          <div className="mt-14 pt-8 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-stone-400">
            {settings.openingHours && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Opening Hours: {settings.openingHours}</span>
              </div>
            )}
            {settings.openingHours && settings.address && (
              <div className="hidden sm:block text-stone-700">•</div>
            )}
            {settings.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{settings.address.split(',')[0]}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
