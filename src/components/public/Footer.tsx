'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';

export default function Footer() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setSettings(getSettings());
    setCurrentYear(new Date().getFullYear());
  }, []);

  const restaurantName = settings?.name || 'GrandLine Fine Dine & Cafe';

  return (
    <footer className="bg-[#121110] text-stone-300 border-t border-stone-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Column 1: Restaurant Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {restaurantName}
              </span>
            </div>
            {settings?.tagline && (
              <p className="text-sm text-stone-400 leading-relaxed">
                {settings.tagline}
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors"
              >
                View Culinary Menu <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Our Menu & Specialties
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Heritage & Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Reservations & Directions
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-stone-500 hover:text-stone-400 transition-colors">
                  Staff Access Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Location */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
              Visit & Contact
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              {settings?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <span className="leading-snug">{settings.address}</span>
                </div>
              )}
              {settings?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
              Service Hours
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              {settings?.openingHours ? (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                  <div>
                    <span className="text-stone-200 block font-medium">Dine-in & Takeaway</span>
                    <span>{settings.openingHours}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Service hours to be announced.</p>
              )}
              <p className="text-xs text-stone-500 pt-2 border-t border-stone-800">
                Freshly prepared per order. Table reservations recommended for weekend dinners.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Primary Restaurant Copyright, Legal Links & Subtle TAPSH Credit */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex flex-wrap items-center gap-3">
            <p>
              &copy; {currentYear} {restaurantName}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-stone-700">•</span>
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-stone-700">•</span>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms & Conditions
            </Link>
          </div>

          {/* TAPSH developer credit - Strict adherence: small, secondary, linking to https://tapsh.in/ */}
          <div className="text-stone-400 tracking-wide text-xs">
            Website crafted by{' '}
            <a
              href="https://tapsh.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-300 hover:text-amber-400 font-medium transition-colors underline decoration-stone-700 underline-offset-4 hover:decoration-amber-400"
            >
              TAPSH
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
