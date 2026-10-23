'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  History,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { RestaurantSettings } from '@/lib/types';
import ThemeToggle from '@/components/ThemeToggle';

interface AdminSidebarProps {
  settings: RestaurantSettings;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  settings,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'POS Billing', href: '/admin/billing', icon: Receipt },
    { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Billing History', href: '/admin/history', icon: History },
    { name: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-stone-950 text-stone-300 border-r border-stone-800">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-stone-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 bg-black shrink-0 shadow-md">
              <Image
                src={settings.logoUrl || '/brand/grand-line-logo.jpg'}
                alt="GRAND LINE CAFÉ & RESTAURANT"
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-serif text-base font-bold text-white truncate uppercase tracking-wide">
                GRAND LINE
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block truncate">
                Café & Restaurant POS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Actions */}
      <div className="p-4 border-t border-stone-800 space-y-3">
        <div className="flex justify-center pb-1">
          <ThemeToggle variant="pill" />
        </div>

        <div className="px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
          <span className="text-stone-400 block text-[11px]">Logged in as</span>
          <span className="text-white font-semibold truncate block">
            {user?.email || 'grandlinecaferestaurant@gmail.com'}
          </span>
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">
            {user?.role || 'Administrator'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-900 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            <span>Open Public Website</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 no-print h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex no-print">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
