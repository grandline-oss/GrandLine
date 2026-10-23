'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Shield } from 'lucide-react';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const logoSrc = settings?.logoUrl || '/brand/grand-line-logo.jpg';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf8f5]/95 dark:bg-[#121110]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-amber-900/30 text-stone-900 dark:text-stone-100 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Official Restaurant Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-amber-500/40 shadow-xs dark:shadow-lg dark:shadow-black/80 shrink-0 bg-stone-100 dark:bg-black group-hover:border-amber-500 transition-all">
              <Image
                src={logoSrc}
                alt="GRAND LINE CAFÉ & RESTAURANT"
                width={56}
                height={56}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-stone-900 dark:text-white block leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors uppercase">
                GRAND LINE
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold block">
                Café & Restaurant
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors py-1 relative ${
                    isActive
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600 dark:bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-400 transition-colors px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200/70 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>{settings.phone}</span>
              </a>
            )}
            <Link
              href="/menu"
              className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-all hover:shadow-amber-600/30 active:scale-95"
            >
              Explore Menu
            </Link>
            <Link
              href="/admin"
              title="Staff & Management Portal"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-300 dark:hover:bg-stone-800/60 transition-colors rounded-lg"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/admin"
              className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
              title="Staff Portal"
            >
              <Shield className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#faf8f5] dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-3">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg"
              >
                <Phone className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                {settings.phone}
              </a>
            )}
            <Link
              href="/menu"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm"
            >
              Explore Our Menu
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
