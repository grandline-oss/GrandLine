'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices, cancelInvoice, deleteInvoice, deleteInvoiceAsync, getSettings } from '@/lib/storage';
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
  Trash2,
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

  // Deletion Modal (for demo/test bills)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

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

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      await deleteInvoiceAsync(deletingInvoice.id);
      loadData();
      setDeleteSuccessMsg(`Bill ${deletingInvoice.invoiceNumber} permanently deleted.`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);
      setDeletingInvoice(null);
    } catch (e) {
      console.error('Delete invoice error:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentSettings = settings || getSettings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold block mb-1">
            Audit Records & Reprints
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Billing History
          </h1>
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          Showing <strong className="text-stone-800 dark:text-stone-200">{filteredInvoices.length}</strong> recorded bills
        </div>
      </div>

      {/* Delete Success Alert */}
      {deleteSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between no-print shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="p-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3 no-print">
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
              placeholder="Search bill # or item..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Payment Method */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
            className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase">
                <th className="py-3.5 px-4">Bill #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
                    No billing records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-500 dark:text-stone-400">
                      {new Date(inv.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-600 dark:text-stone-300">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">{inv.items.length}</span> items
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {formatInr(inv.grandTotalPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          inv.paymentStatus === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {inv.paymentStatus === 'COMPLETED' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                        )}
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReprint(inv)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-600 dark:hover:bg-amber-600 hover:text-white dark:hover:text-white text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Reprint Thermal Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint</span>
                        </button>

                        {inv.paymentStatus === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => openCancelModal(inv)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                            title="Cancel Bill with Reason"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeletingInvoice(inv)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                          title="Delete Bill (Demo / Mistake)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 transition-colors"
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
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[95vh] overflow-y-auto">
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
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Cancel Bill {cancellingInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancellingInvoice(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 mb-4">
              Cancelling will preserve the historical record of this bill for audit purposes, but exclude its total from sales revenue and active reports.
            </p>

            {cancelError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {cancelError}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                Reason for Cancellation *
              </label>
              <textarea
                rows={3}
                required
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Customer changed mind, wrong item billed..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 mt-5">
              <button
                type="button"
                onClick={() => setCancellingInvoice(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE CONFIRMATION MODAL */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs no-print">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white leading-tight">
                    Delete Bill Record
                  </h3>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Demo & Audit Record Management
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeletingInvoice(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 rounded-2xl p-4 mb-5 text-xs text-rose-950 dark:text-rose-200 space-y-3">
              <p className="font-semibold text-rose-900 dark:text-rose-300">
                Are you sure you want to permanently delete this bill?
              </p>

              <div className="bg-white dark:bg-stone-800 rounded-xl p-3 border border-rose-200/60 dark:border-rose-900/60 space-y-1.5 font-mono text-stone-800 dark:text-stone-200 text-[11px] shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Bill Number:</span>
                  <strong className="text-stone-950 dark:text-white">{deletingInvoice.invoiceNumber}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Amount:</span>
                  <strong className="text-stone-950 dark:text-white">{formatInr(deletingInvoice.grandTotalPaise)}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Date:</span>
                  <span className="text-stone-700 dark:text-stone-300 text-[10px]">
                    {new Date(deletingInvoice.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 dark:text-stone-400 font-sans">Status:</span>
                  <span
                    className={`font-sans font-bold text-[10px] px-2 py-0.5 rounded-full ${
                      deletingInvoice.paymentStatus === 'COMPLETED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {deletingInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                ⚠️ <strong>Warning:</strong> This action cannot be undone. This demo bill will be permanently removed from storage and reports.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
