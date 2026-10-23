'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const CONSENT_STORAGE_KEY = 'grandline_cookie_consent_v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) {
        // Small delay so it appears smoothly without blocking initial render
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConsent = (choice: 'accepted' | 'essential') => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-stone-900/95 backdrop-blur-md text-stone-200 border border-stone-800 p-5 rounded-2xl shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-amber-500 font-semibold text-xs uppercase tracking-wider">
            <Cookie className="w-4 h-4 shrink-0" />
            <span>Privacy & Cookies</span>
          </div>
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="text-stone-400 hover:text-white p-1"
            aria-label="Dismiss cookie notice with essential cookies only"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-300 leading-relaxed">
          We use essential cookies and local storage to guarantee secure navigation and remember your dining preferences. We do not sell your personal data. Read our{' '}
          <Link href="/privacy" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">
            Privacy Policy
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleConsent('accepted')}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleConsent('essential')}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors border border-stone-700"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
