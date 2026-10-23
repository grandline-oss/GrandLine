'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getSettings } from '@/lib/storage';
import { UtensilsCrossed, Lock, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@grandline.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const settings = getSettings();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      setError('An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Back to website */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-white transition-colors py-1.5 px-3 rounded-full bg-stone-900 border border-stone-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>

        {/* Restaurant Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-amber-950/50 mb-4">
          <UtensilsCrossed className="w-7 h-7" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {settings.name}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-amber-500 font-semibold">
          Management & POS Billing Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-stone-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-stone-800">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Administrator / Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grandline.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Management'}
            </button>
          </form>

          {/* Quick Info Box for development review */}
          <div className="mt-6 pt-5 border-t border-stone-800 text-center">
            <span className="text-[11px] text-stone-400 block font-medium">Default Credentials:</span>
            <code className="text-[11px] text-amber-400 font-mono bg-stone-950 px-2 py-1 rounded mt-1 inline-block border border-stone-800">
              admin@grandline.com / admin123
            </code>
            <p className="text-[10px] text-stone-500 mt-2">
              Credentials can be updated at any time in Settings &rarr; Account Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
