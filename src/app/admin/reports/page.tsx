'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices, getSettings } from '@/lib/storage';
import { Invoice, RestaurantSettings } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import SvgChart from '@/components/ui/SvgChart';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  IndianRupee,
  Receipt,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  // Time Range Selection
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    setInvoices(getInvoices());
    setSettings(getSettings());
    setMounted(true);
  }, []);

  // Filter invoices based on date range
  const filteredInvoices = useMemo(() => {
    if (!mounted) return [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return invoices.filter((inv) => {
      const invTime = new Date(inv.createdAt).getTime();

      if (dateRange === 'today') {
        return invTime >= todayStart;
      }
      if (dateRange === '7days') {
        return invTime >= todayStart - 6 * 24 * 3600 * 1000;
      }
      if (dateRange === '30days') {
        return invTime >= todayStart - 29 * 24 * 3600 * 1000;
      }
      if (dateRange === 'custom') {
        if (customStartDate && invTime < new Date(customStartDate).getTime()) return false;
        if (customEndDate && invTime > new Date(customEndDate).getTime() + 86400000) return false;
        return true;
      }
      return true;
    });
  }, [invoices, dateRange, customStartDate, customEndDate, mounted]);

  // Calculations
  const completedInvoices = filteredInvoices.filter((i) => i.paymentStatus === 'COMPLETED');
  const cancelledInvoices = filteredInvoices.filter((i) => i.paymentStatus === 'CANCELLED');

  const grossSalesPaise = completedInvoices.reduce((acc, i) => acc + i.subtotalPaise, 0);
  const totalDiscountPaise = completedInvoices.reduce((acc, i) => acc + i.discountPaise, 0);
  const totalTaxPaise = completedInvoices.reduce((acc, i) => acc + i.taxPaise, 0);
  const netSalesPaise = completedInvoices.reduce((acc, i) => acc + i.grandTotalPaise, 0);

  const completedBillsCount = completedInvoices.length;
  const avgBillPaise = completedBillsCount > 0 ? Math.round(netSalesPaise / completedBillsCount) : 0;

  // Payment Breakdown
  const paymentSummary = completedInvoices.reduce<Record<string, { count: number; totalPaise: number }>>(
    (acc, inv) => {
      const mode = inv.paymentMethod || 'OTHER';
      if (!acc[mode]) acc[mode] = { count: 0, totalPaise: 0 };
      acc[mode].count += 1;
      acc[mode].totalPaise += inv.grandTotalPaise;
      return acc;
    },
    {}
  );

  // Item-wise Breakdown
  const itemSummary: Record<string, { name: string; quantity: number; revenuePaise: number }> = {};
  completedInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      if (!itemSummary[item.itemId]) {
        itemSummary[item.itemId] = { name: item.name, quantity: 0, revenuePaise: 0 };
      }
      itemSummary[item.itemId].quantity += item.quantity;
      itemSummary[item.itemId].revenuePaise += item.lineTotalPaise;
    });
  });

  const itemSummaryList = Object.values(itemSummary).sort((a, b) => b.quantity - a.quantity);

  // Chart data points
  const chartPoints = useMemo(() => {
    if (!mounted) return [];
    const days = 7;
    return Array.from({ length: days }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dStr = d.toDateString();
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      const dayTotal = completedInvoices
        .filter((inv) => new Date(inv.createdAt).toDateString() === dStr)
        .reduce((sum, inv) => sum + inv.grandTotalPaise, 0);

      return {
        date: dStr,
        label,
        amountPaise: dayTotal,
      };
    });
  }, [completedInvoices, mounted]);

  // CSV Export Action
  const handleExportCSV = () => {
    if (completedInvoices.length === 0) {
      alert('No completed invoices in the selected period to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Date & Time',
      'Items Count',
      'Payment Method',
      'Subtotal (INR)',
      'Discount (INR)',
      'Tax (INR)',
      'Grand Total (INR)',
      'Status',
    ];

    const rows = completedInvoices.map((inv) => [
      inv.invoiceNumber,
      `"${new Date(inv.createdAt).toLocaleString('en-IN')}"`,
      inv.items.length,
      inv.paymentMethod,
      (inv.subtotalPaise / 100).toFixed(2),
      (inv.discountPaise / 100).toFixed(2),
      (inv.taxPaise / 100).toFixed(2),
      (inv.grandTotalPaise / 100).toFixed(2),
      inv.paymentStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-1">
            Financial & Operational Insights
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Sales & Revenue Reports
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector (Hidden on print) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-700">Period:</span>
          {(['today', '7days', '30days', 'custom'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateRange === r
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r === 'today' && 'Today'}
              {r === '7days' && 'Last 7 Days'}
              {r === '30days' && 'Last 30 Days'}
              {r === 'custom' && 'Custom Range'}
            </button>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50"
            />
            <span className="text-stone-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-stone-500 block mb-1">
            Net Realized Sales
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {formatInr(netSalesPaise)}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            Subtotal: {formatInr(grossSalesPaise)} | Dis: -{formatInr(totalDiscountPaise)}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-stone-500 block mb-1">
            Completed Invoices
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {completedBillsCount}
          </div>
          <span className="text-xs text-rose-600 mt-1 block">
            {cancelledInvoices.length} cancelled bills excluded
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-stone-500 block mb-1">
            Average Ticket Size
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {formatInr(avgBillPaise)}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">Per completed transaction</span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold uppercase text-stone-500 block mb-1">
            Tax Collected
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            {formatInr(totalTaxPaise)}
          </div>
          <span className="text-xs text-stone-400 mt-1 block">
            {settings?.taxEnabled ? 'GST Active' : 'GST Disabled (Zero Tax)'}
          </span>
        </div>
      </div>

      {/* Visual Chart (Screen only) */}
      <div className="no-print">
        <SvgChart data={chartPoints} title="Sales Revenue Trend" />
      </div>

      {/* Item-wise Sales & Payment Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Sales Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900 mb-4">
            Dish Performance & Quantity Sold
          </h3>

          {itemSummaryList.length === 0 ? (
            <p className="text-xs text-stone-400 py-6">No dish sales in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 uppercase font-semibold">
                    <th className="pb-3">Rank</th>
                    <th className="pb-3">Dish Name</th>
                    <th className="pb-3 text-center">Quantity Sold</th>
                    <th className="pb-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {itemSummaryList.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-stone-50/50">
                      <td className="py-2.5 font-bold text-stone-400 w-12">{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-stone-900">{item.name}</td>
                      <td className="py-2.5 text-center font-bold text-stone-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-stone-900">
                        {formatInr(item.revenuePaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <h3 className="font-serif text-base font-bold text-stone-900 mb-4">
            Payment Mode Realization
          </h3>

          <div className="space-y-4">
            {['CASH', 'UPI', 'CARD', 'OTHER'].map((mode) => {
              const info = paymentSummary[mode] || { count: 0, totalPaise: 0 };
              const percent =
                netSalesPaise > 0 ? Math.round((info.totalPaise / netSalesPaise) * 100) : 0;

              return (
                <div key={mode} className="space-y-1.5 pb-3 border-b border-stone-100 last:border-none">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{mode}</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {formatInr(info.totalPaise)}
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>{info.count} bills</span>
                    <span>{percent}% of total sales</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
