'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/auth';
import { getSettings } from '@/lib/storage';
import { RestaurantSettings } from '@/lib/types';
import { Menu, Receipt, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSettings(getSettings());
  }, [pathname]);

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  // If on login page, render clean layout without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading || (!user && pathname !== '/admin/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-300">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
            Verifying Staff Access...
          </span>
        </div>
      </div>
    );
  }

  const currentSettings = settings || getSettings();

  return (
    <div className="min-h-screen flex bg-stone-100 text-stone-900">
      {/* Sidebar */}
      <AdminSidebar
        settings={currentSettings}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile / Screen Header (hidden when printing) */}
        <header className="lg:hidden no-print sticky top-0 z-30 bg-stone-950 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold text-sm text-white truncate max-w-[180px]">
              {currentSettings.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/billing"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>POS Bill</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
