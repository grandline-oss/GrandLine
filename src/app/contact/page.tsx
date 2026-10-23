'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, CheckCircle } from 'lucide-react';

import { checkRateLimit, recordFailedAttempt } from '@/lib/security';
import Link from 'next/link';

export default function ContactPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '2',
    notes: '',
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const restaurantName = settings?.name || 'GrandLine Fine Dine & Cafe';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Anti-spam bot trap (honeypot)
    if (honeypot.trim() !== '') {
      // Silently discard automated bot submission
      setSubmitted(true);
      return;
    }

    // 2. Client & Session Rate Limiting
    const rateCheck = checkRateLimit('contact_inquiry', 4, 10 * 60 * 1000, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      setErrorMsg(`Too many inquiries submitted. Please wait ${rateCheck.waitSeconds}s or call us directly.`);
      return;
    }

    // 3. Validation
    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Please enter both your name and contact phone number.');
      return;
    }

    if (form.phone.replace(/\D/g, '').length < 8) {
      setErrorMsg('Please enter a valid phone number with area/country code.');
      return;
    }

    recordFailedAttempt('contact_inquiry', 4, 5 * 60 * 1000);
    setSubmitted(true);
  };

  const cleanPhone = settings?.phone?.replace(/\D/g, '') || '';
  const cleanWhatsapp = settings?.whatsapp?.replace(/\D/g, '') || cleanPhone;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-stone-900 text-white py-16 sm:py-20 border-b border-stone-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-2">
              We Look Forward to Seeing You
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Contact & Reservations
            </h1>
            <p className="max-w-xl mx-auto text-stone-300 text-sm sm:text-base leading-relaxed">
              Find our exact location, check daily opening hours, or reach out to our team directly via phone or WhatsApp.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Details & Direct Actions */}
            <div className="space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
                  Location & Hours
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {restaurantName}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Address Card */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                      Address
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {settings?.address || '14, Marine Drive Promenade, Near Harbour Point, Kochi, Kerala - 682001'}
                    </p>
                    {settings?.googleMapsUrl && (
                      <a
                        href={settings.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 pt-2"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Hours Card */}
                <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide">
                      Dine-in & Takeaway Hours
                    </h3>
                    <p className="text-stone-600 text-sm">
                      {settings?.openingHours || 'Monday – Sunday: 11:30 AM – 11:30 PM'}
                    </p>
                    <p className="text-xs text-stone-500 pt-1">
                      Kitchen accepts last orders 30 minutes prior to closing.
                    </p>
                  </div>
                </div>

                {/* Direct Calling & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {settings?.phone && (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white transition-all flex items-center gap-3.5 shadow-md group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-stone-800 group-hover:bg-amber-600 text-amber-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-stone-400 block font-medium">Direct Call</span>
                        <span className="text-sm font-bold text-white block">{settings.phone}</span>
                      </div>
                    </a>
                  )}

                  {cleanWhatsapp && (
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=Hello%20${encodeURIComponent(
                        restaurantName
                      )}%2C%20I%20would%20like%20to%20inquire%20about%20a%20table%20reservation.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center gap-3.5 shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-emerald-200 block font-medium">Chat on WhatsApp</span>
                        <span className="text-sm font-bold text-white block">Quick Assistance</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Table Reservation Inquiry Form */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
                Table Inquiry
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                Reserve Your Dining Experience
              </h3>
              <p className="text-stone-600 text-sm mb-6">
                Fill out the details below and our restaurant host will confirm table availability for your group.
              </p>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-emerald-900">
                    Inquiry Received!
                  </h4>
                  <p className="text-sm text-emerald-800">
                    Thank you, {form.name}. Our front desk will contact you at {form.phone} shortly to confirm your reservation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', phone: '', date: '', guests: '2', notes: '' });
                    }}
                    className="text-xs font-semibold text-emerald-900 underline mt-2"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                      {errorMsg}
                    </div>
                  )}

                  {/* Honeypot field for spam prevention - hidden from humans */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_check">Leave empty</label>
                    <input
                      id="website_check"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                        Guests
                      </label>
                      <select
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3-4 Guests</option>
                        <option value="5">5-6 Guests</option>
                        <option value="8">8+ Guests (Celebration)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                      Preferred Date & Time
                    </label>
                    <input
                      type="text"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">
                      Special Requests / Dietary Notes
                    </label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Privacy Notice */}
                  <p className="text-[11px] text-stone-500 leading-normal pt-1">
                    Your details are used solely to confirm this table inquiry. We never send spam or share your number. See our{' '}
                    <Link href="/privacy" className="text-amber-700 underline underline-offset-2">
                      Privacy Policy
                    </Link>.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
                  >
                    Submit Reservation Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
