'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  getCategories,
  getMenuItems,
  getSettings,
  createInvoice,
} from '@/lib/storage';
import { Category, MenuItem, RestaurantSettings, Invoice, PaymentMethod } from '@/lib/types';
import { calculateBill, formatInr } from '@/lib/currency';
import ThermalReceipt from '@/components/billing/ThermalReceipt';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function AdminBillingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  // POS State
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Completed Invoice for direct printing
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setCategories(getCategories().filter((c) => c.isActive));
    setMenuItems(getMenuItems().filter((i) => i.isAvailable));
    setSettings(getSettings());
  }, []);

  // Filtered menu items for POS grid
  const filteredItems = useMemo(() => {
    return menuItems.filter((i) => {
      if (selectedCat !== 'all' && i.categoryId !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return i.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [menuItems, selectedCat, searchQuery]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const clearCart = () => {
    if (cart.length > 0 && confirm('Clear all items from current bill?')) {
      setCart([]);
      setErrorMsg(null);
    }
  };

  // Bill Calculations via integer paise math (Zero discount)
  const currentSettings = settings || getSettings();
  const calculationItems = cart.map((ci) => ({
    itemId: ci.item.id,
    name: ci.item.name,
    quantity: ci.quantity,
    unitPricePaise: ci.item.pricePaise,
  }));

  const billCalc = calculateBill(
    calculationItems,
    0, // No discount
    currentSettings.taxEnabled,
    currentSettings.cgstPercent,
    currentSettings.sgstPercent
  );

  // Complete Bill Action - Immediately saves and prints directly to printer
  const handleCompleteBill = () => {
    if (cart.length === 0) {
      setErrorMsg('Please select items from the menu to complete the bill.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = createInvoice({
        items: cart.map((ci) => ({ itemId: ci.item.id, quantity: ci.quantity })),
        discountPercent: 0,
        paymentMethod,
      });

      if (res.success && res.invoice) {
        const inv = res.invoice;
        setCompletedInvoice(inv);
        // Clear cart immediately for next bill
        setCart([]);
        setErrorMsg(null);
        setSuccessMsg(`Bill ${inv.invoiceNumber} completed! Sending to printer...`);
        setTimeout(() => setSuccessMsg(null), 3500);

        // Directly print to printer without any 2nd options
        setTimeout(() => {
          window.print();
        }, 120);
      } else {
        setErrorMsg(res.error || 'Failed to complete bill.');
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Billing error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Status */}
      <div className="flex items-center justify-between no-print">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block">
            Express Counter POS
          </span>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Billing & Receipt Generation
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-stone-500 block">Printer Configured</span>
            <span className="text-xs font-bold text-stone-800">
              TVS RP 3200 LITE ({currentSettings.receiptPaperWidth})
            </span>
          </div>
          {/* Tax Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentSettings.taxEnabled
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {currentSettings.taxEnabled ? 'GST Enabled' : 'Tax Disabled (Default)'}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between no-print animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Billing Grid: Left Menu Selection, Right Bill Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* LEFT COLUMN: Categories & Items (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories Bar */}
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food & beverages..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pos-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCat('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCat === c.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1 pos-scrollbar">
            {filteredItems.map((dish) => {
              const inCartQty = cart.find((ci) => ci.item.id === dish.id)?.quantity || 0;

              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => addToCart(dish)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 group relative ${
                    inCartQty > 0
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/30 shadow-xs'
                      : 'bg-white border-stone-200/90 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  {/* Selected count pill */}
                  {inCartQty > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                      {inCartQty}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span className="text-[10px] uppercase font-semibold text-stone-500">
                        {dish.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-tight">
                      {dish.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-amber-700">
                      {formatInr(dish.pricePaise)}
                    </span>
                    <span className="w-5 h-5 rounded-md bg-stone-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center text-xs text-stone-600 transition-colors">
                      +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Current Bill & Calculations (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Current Order</h3>
                <span className="text-xs text-stone-500">{cart.length} items selected</span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-xs">
                Select items from the menu on the left to start building the bill.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 pos-scrollbar pr-1">
                {cart.map((ci) => (
                  <div key={ci.item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-stone-900 truncate block">
                        {ci.item.name}
                      </span>
                      <span className="text-stone-500 font-mono">
                        {formatInr(ci.item.pricePaise)} × {ci.quantity}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 bg-stone-100 rounded-lg p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(ci.item.id, -1)}
                        className="w-5 h-5 rounded bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold font-mono text-stone-900">
                        {ci.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(ci.item.id, 1)}
                        className="w-5 h-5 rounded bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <div className="text-right w-16 shrink-0">
                      <span className="font-bold text-stone-900">
                        {formatInr(ci.item.pricePaise * ci.quantity)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(ci.item.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calculations & Direct Checkout (Discount and Cash Received removed per requirement) */}
          <div className="pt-4 border-t border-stone-200 space-y-3 mt-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Subtotal ({billCalc.items.length} items):</span>
              <span className="font-semibold font-mono text-stone-900">
                {formatInr(billCalc.subtotalPaise)}
              </span>
            </div>

            {/* Tax breakdown only if explicitly enabled */}
            {billCalc.taxEnabled && billCalc.taxPaise > 0 && billCalc.taxBreakdown && (
              <div className="space-y-1 text-xs text-stone-600 border-t border-dashed border-stone-200 pt-2">
                <div className="flex items-center justify-between">
                  <span>CGST ({currentSettings.cgstPercent}%):</span>
                  <span>{formatInr(billCalc.taxBreakdown.cgstPaise)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>SGST ({currentSettings.sgstPercent}%):</span>
                  <span>{formatInr(billCalc.taxBreakdown.sgstPaise)}</span>
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-stone-900 text-base font-bold text-stone-900">
              <span>Grand Total:</span>
              <span className="font-serif text-xl text-amber-700">
                {formatInr(billCalc.grandTotalPaise)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* Complete Bill & Direct Print Button (No 2nd options, prints directly to TVS RP 3200 LITE) */}
            <button
              type="button"
              disabled={cart.length === 0 || submitting}
              onClick={handleCompleteBill}
              className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{submitting ? 'Printing Bill...' : 'Complete Bill & Print'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* DIRECT PRINT RECEIPT (Hidden on-screen, printed directly via TVS RP 3200 LITE) */}
      {completedInvoice && (
        <div className="print-only">
          <ThermalReceipt
            invoice={completedInvoice}
            settings={currentSettings}
            hideControls={true}
          />
        </div>
      )}
    </div>
  );
}
