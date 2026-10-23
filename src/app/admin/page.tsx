'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getInvoices, getMenuItems, getSettings } from '@/lib/storage';
import { Invoice, MenuItem, RestaurantSettings } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import SvgChart from '@/components/ui/SvgChart';
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setInvoices(getInvoices());
    setMenuItems(getMenuItems());
    setSettings(getSettings());
    setMounted(true);
  }, []);

  // Filter completed invoices vs cancelled
  const completedInvoices = invoices.filter((inv) => inv.paymentStatus === 'COMPLETED');

  // Today's metrics (using local date string after mount)
  const todayStr = mounted ? new Date().toDateString() : '';
  const todayCompletedInvoices = completedInvoices.filter(
    (inv) => new Date(inv.createdAt).toDateString() === todayStr
  );

  const todaySalesPaise = todayCompletedInvoices.reduce(
    (sum, inv) => sum + inv.grandTotalPaise,
    0
  );
  const todayBillsCount = todayCompletedInvoices.length;
  const averageBillValuePaise =
    todayBillsCount > 0 ? Math.round(todaySalesPaise / todayBillsCount) : 0;

  // Payment method breakdown for completed invoices
  const paymentMethodSummary = completedInvoices.reduce<Record<string, { count: number; totalPaise: number }>>(
    (acc, inv) => {
      const mode = inv.paymentMethod || 'OTHER';
      if (!acc[mode]) {
        acc[mode] = { count: 0, totalPaise: 0 };
      }
      acc[mode].count += 1;
      acc[mode].totalPaise += inv.grandTotalPaise;
      return acc;
    },
    {}
  );

  // Best-selling items calculation from saved completed invoices
  const itemSalesMap: Record<string, { name: string; quantity: number; revenuePaise: number }> = {};
  completedInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!itemSalesMap[item.itemId]) {
        itemSalesMap[item.itemId] = {
          name: item.name,
          quantity: 0,
          revenuePaise: 0,
        };
      }
      itemSalesMap[item.itemId].quantity += item.quantity;
      itemSalesMap[item.itemId].revenuePaise += item.lineTotalPaise;
    });
  });

  const bestSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Last 7 days sales data for chart
  const last7DaysData = mounted
    ? Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toDateString();
        const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

        const dayTotal = completedInvoices
          .filter((inv) => new Date(inv.createdAt).toDateString() === dayStr)
          .reduce((sum, inv) => sum + inv.grandTotalPaise, 0);

        return {
          date: dayStr,
          label: dayLabel,
          amountPaise: dayTotal,
        };
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-1">
            Overview & Real-time Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Restaurant Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/billing"
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>Open POS Billing</span>
          </Link>
          <Link
            href="/admin/menu"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs sm:text-sm font-semibold border border-stone-200 flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-stone-600" />
            <span>Manage Menu</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Sales */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Sales</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {formatInr(todaySalesPaise)}
            </div>
            <span className="text-xs text-stone-500 mt-1 block">
              From completed transactions today
            </span>
          </div>
        </div>

        {/* Card 2: Today's Completed Bills */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bills Generated</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {todayBillsCount}
            </div>
            <span className="text-xs text-stone-500 mt-1 block">
              Active dining & takeaway orders
            </span>
          </div>
        </div>

        {/* Card 3: Average Bill Value */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg. Bill Value</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {formatInr(averageBillValuePaise)}
            </div>
            <span className="text-xs text-stone-500 mt-1 block">
              Average ticket size today
            </span>
          </div>
        </div>

        {/* Card 4: Total Menu Items */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dishes</span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {menuItems.filter((i) => i.isAvailable).length}
            </div>
            <span className="text-xs text-stone-500 mt-1 block">
              Out of {menuItems.length} total dishes listed
            </span>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <SvgChart data={last7DaysData} title="Sales Revenue (Last 7 Days)" />

      {/* Split Section: Recent Invoices & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">Recent Invoices</h3>
              <p className="text-xs text-stone-500">Latest transactions saved to database</p>
            </div>
            <Link
              href="/admin/history"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {invoices.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No bills recorded yet. Create your first bill in POS Billing!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase">
                    <th className="pb-3">Bill #</th>
                    <th className="pb-3">Date / Time</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Mode</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {invoices.slice(0, 5).map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 font-mono font-medium text-stone-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 text-xs text-stone-500">
                        {new Date(inv.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 text-xs text-stone-600">
                        {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-stone-900">
                        {formatInr(inv.grandTotalPaise)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            inv.paymentStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Payment Breakdown & Best Sellers */}
        <div className="space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Payment Methods</span>
            </h3>

            <div className="space-y-3">
              {['CASH', 'UPI', 'CARD', 'OTHER'].map((mode) => {
                const info = paymentMethodSummary[mode] || { count: 0, totalPaise: 0 };
                return (
                  <div key={mode} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-stone-700">{mode}</span>
                      <span className="text-stone-400">({info.count} bills)</span>
                    </div>
                    <span className="font-bold text-stone-900">
                      {formatInr(info.totalPaise)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <h3 className="font-serif text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Best-Selling Dishes</span>
            </h3>

            {bestSellingItems.length === 0 ? (
              <p className="text-xs text-stone-400">No item sales recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {bestSellingItems.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="font-mono text-stone-400 font-bold w-4">{idx + 1}.</span>
                      <span className="font-medium text-stone-800 truncate max-w-[140px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-900 font-semibold block">{item.quantity} sold</span>
                      <span className="text-[10px] text-stone-400">{formatInr(item.revenuePaise)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
