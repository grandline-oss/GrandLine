import React from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | GRAND LINE CAFÉ & RESTAURANT',
  description: 'Our commitment to protecting your privacy, data handling policies, and consumer rights at GRAND LINE CAFÉ & RESTAURANT.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900">
      <Header />

      <main className="flex-1 py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm space-y-8">
          <div className="border-b border-stone-100 pb-6">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <Shield className="w-6 h-6" />
              <span className="text-xs uppercase font-bold tracking-widest">Legal & Compliance</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
              Privacy Policy
            </h1>
            <p className="text-xs text-stone-400 mt-2">
              Last updated: October 2026 | Effective for GRAND LINE CAFÉ & RESTAURANT
            </p>
          </div>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">1. Overview</h2>
            <p>
              GRAND LINE CAFÉ & RESTAURANT (&quot;GRAND LINE&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is dedicated to respecting and protecting the privacy of our dining guests, website visitors, and patrons. This Privacy Policy details the types of personal data we collect, how it is safeguarded, and your statutory rights under applicable privacy legislation (including India&apos;s Digital Personal Data Protection Act).
            </p>
          </section>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">2. Information We Collect</h2>
            <p>
              We adhere strictly to data minimization and collect only what is essential to provide restaurant services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Table Inquiries & Contact Requests:</strong> Name, phone number, email address, and dining preferences when submitted voluntarily through our reservation/contact form.
              </li>
              <li>
                <strong>Transaction & Invoicing Data:</strong> Items ordered, payment method (Cash, UPI, Card), and billing timestamp. We <em>do not</em> store complete credit/debit card numbers or UPI PINs.
              </li>
              <li>
                <strong>Technical & Essential Session Data:</strong> Basic HTTP request headers, IP address, and essential session identifiers necessary to ensure secure operation and prevent automated abuse.
              </li>
            </ul>
          </section>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">3. Purpose and Legal Basis for Processing</h2>
            <p>Your data is processed strictly for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Facilitating dining table inquiries and responding to customer questions.</li>
              <li>Fulfilling legal and tax obligations, including GST and invoice generation where applicable.</li>
              <li>Protecting website integrity, preventing unauthorized administrative access, and mitigating brute-force risks.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or monetize your personal information to third-party advertisers or data brokers.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">4. Third-Party Service Providers</h2>
            <p>
              We utilize trusted cloud service providers to maintain operations:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hosting:</strong> Vercel Inc. (Secure web application hosting and Content Delivery Network).</li>
              <li><strong>Database & Authentication:</strong> Google Cloud Firebase (Cloud Firestore and Firebase Authentication).</li>
            </ul>
            <p>
              All service providers process data under strict data processing agreements and enterprise security standards.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">5. Data Retention & Security</h2>
            <p>
              We retain billing and invoice records in accordance with statutory accounting and commercial tax record requirements. Contact form inquiries are purged after fulfillment. Technical measures include TLS 1.3 in-transit encryption, strict Content Security Policy, and rate-limiting.
            </p>
          </section>

          <section className="space-y-4 text-stone-700 leading-relaxed text-sm">
            <h2 className="font-serif text-xl font-bold text-stone-900">6. Your Rights & Privacy Requests</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal contact records (subject to statutory accounting retention exemptions). To exercise these rights, please contact our administration at:
            </p>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <p><strong>GRAND LINE CAFÉ & RESTAURANT</strong></p>
              <p>Email: <a href="mailto:grandlinecaferestaurant@gmail.com" className="text-amber-700 underline font-medium">grandlinecaferestaurant@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
