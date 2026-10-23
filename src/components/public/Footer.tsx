'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

export default function Footer() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setSettings(getSettings());
    setCurrentYear(new Date().getFullYear());
  }, []);

  const restaurantName = settings?.name || 'GRAND LINE CAFÉ & RESTAURANT';
  const logoSrc = settings?.logoUrl || '/brand/grand-line-logo.jpg';

  return (
    <footer className="bg-[#0e0d0c] text-stone-300 border-t border-amber-900/40 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Column 1: Official Restaurant Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg shadow-black/80 shrink-0 bg-black">
                <Image
                  src={logoSrc}
                  alt={restaurantName}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-wider text-white block uppercase leading-tight">
                  GRAND LINE
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold block">
                  Café & Restaurant
                </span>
              </div>
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
                View Menu <ArrowRight className="w-3.5 h-3.5" />
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
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
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
                    <span>{settings.openingHours}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Service hours to be announced.</p>
              )}
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

          <div className="flex items-center gap-4">
            <ThemeToggle variant="pill" />
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
      </div>
    </footer>
  );
}
