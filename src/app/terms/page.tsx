import React from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms and Conditions | GRAND LINE CAFÉ & RESTAURANT',
  description: 'Terms of service, dining policies, reservation guidelines, and website conditions for GRAND LINE CAFÉ & RESTAURANT.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#121214] text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <Header />

      <main className="flex-1 py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </Link>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 sm:p-12 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-8">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-6">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
              <FileText className="w-6 h-6" />
              <span className="text-xs uppercase font-bold tracking-widest">Legal Agreement</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950 dark:text-stone-100">
              Terms & Conditions
            </h1>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
              Last updated: October 2026 | Governing dining and website usage
            </p>
          </div>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">1. Acceptance of Terms</h2>
            <p>
              By accessing the GRAND LINE CAFÉ & RESTAURANT website or visiting our dining premises, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, please refrain from using our digital services.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">2. Menu, Pricing & Allergen Information</h2>
            <p>
              All menu listings, items, and prices are subject to change based on kitchen and market availability. While our kitchen team takes meticulous care regarding preparation, guests with food allergies must inform service staff prior to ordering.
            </p>
            <p>
              Prices shown in our dining room and invoices are in Indian Rupees (₹). Applicable GST or statutory levies will be itemized on the final tax invoice when activated per statutory thresholds.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">3. Table Inquiries & Reservations</h2>
            <p>
              Online or telephone table reservations are held for up to 15 minutes past the reserved time during peak dining hours before being released to walk-in patrons. Please notify us promptly if your schedule changes.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">4. Billing & Refund Policy</h2>
            <p>
              Our website serves as an informational menu presentation platform; transactions and payment settlements occur in-person at the restaurant cash counter via Cash, UPI, or Card. If an item does not meet standards or an error occurs in the bill, please bring it to the attention of the restaurant manager immediately before settling the bill for resolution or adjustment.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">5. Intellectual Property</h2>
            <p>
              The GRAND LINE CAFÉ & RESTAURANT trademark, logo, food photography, menu descriptions, and website branding are the intellectual property of GRAND LINE CAFÉ & RESTAURANT. Unauthorized reproduction or commercial use is prohibited without prior written consent.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">6. Contact for Inquiries</h2>
            <p>For questions or inquiries regarding these terms, reach us at:</p>
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
              <p><strong>GRAND LINE CAFÉ & RESTAURANT</strong></p>
              <p>Email: <a href="mailto:grandlinecaferestaurant@gmail.com" className="text-amber-700 dark:text-amber-400 underline font-medium">grandlinecaferestaurant@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
