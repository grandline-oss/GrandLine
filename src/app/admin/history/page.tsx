'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices, cancelInvoice, getSettings } from '@/lib/storage';
import { Invoice, RestaurantSettings } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import ThermalReceipt from '@/components/billing/ThermalReceipt';
import {
  Search,
  Printer,
  Ban,
  FileText,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminBillingHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Invoice for Detail / Reprint
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);

  // Cancellation Modal
  const [cancellingInvoice, setCancellingInvoice] = useState<Invoice | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadData = () => {
    setInvoices(getInvoices());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (statusFilter !== 'ALL' && inv.paymentStatus !== statusFilter) return false;

      // Payment mode filter
      if (paymentFilter !== 'ALL' && inv.paymentMethod !== paymentFilter) return false;

      // Date filter (YYYY-MM-DD match)
      if (dateFilter) {
        const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
        if (invDate !== dateFilter) return false;
      }

      // Search query (invoice number or item name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesItem = inv.items.some((it) => it.name.toLowerCase().includes(q));
        return matchesNum || matchesItem;
      }

      return true;
    });
  }, [invoices, statusFilter, paymentFilter, dateFilter, searchQuery]);

  // Paginated list
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReprint = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsReprintModalOpen(true);
  };

  const openCancelModal = (inv: Invoice) => {
    setCancellingInvoice(inv);
    setCancellationReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = () => {
    if (!cancellingInvoice) return;
    if (!cancellationReason.trim()) {
      setCancelError('Please specify the reason for cancelling this bill.');
      return;
    }

    const updated = cancelInvoice(cancellingInvoice.id, cancellationReason.trim());
    if (updated) {
      setCancellingInvoice(null);
      loadData();
    }
  };

  const currentSettings = settings || getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-1">
            Audit Records & Reprints
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Billing History
          </h1>
        </div>
        <div className="text-xs text-stone-500">
          Showing <strong>{filteredInvoices.length}</strong> recorded bills
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by Bill # */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Bill # or dish..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Date Picker */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Payment Method */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'CANCELLED');
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase">
                <th className="py-3.5 px-4">Bill #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">
                    No billing records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-500">
                      {new Date(inv.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-600">
                      <span className="font-semibold text-stone-800">{inv.items.length}</span> items
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900 font-mono">
                      {formatInr(inv.grandTotalPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {inv.paymentStatus === 'COMPLETED' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReprint(inv)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-600 hover:text-white text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Reprint Thermal Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint</span>
                        </button>

                        {inv.paymentStatus === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => openCancelModal(inv)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cancel Bill with Reason"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* REPRINT RECEIPT MODAL */}
      {isReprintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 max-h-[95vh] overflow-y-auto">
            <ThermalReceipt
              invoice={selectedInvoice}
              settings={currentSettings}
              autoPrint={false}
              onClose={() => {
                setIsReprintModalOpen(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}

      {/* CANCEL INVOICE MODAL */}
      {cancellingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold">Cancel Bill {cancellingInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingInvoice(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Cancelling will preserve the historical record of this bill for audit purposes, but exclude its total from sales revenue and active reports.
            </p>

            {cancelError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Guest changed mind, incorrect table billed, cashier re-entry..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 mt-5">
              <button
                type="button"
                onClick={() => setCancellingInvoice(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
