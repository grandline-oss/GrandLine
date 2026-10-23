'use client';

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/storage';
import { RestaurantSettings, ReceiptPaperWidth } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import {
  Building2,
  Receipt,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Printer,
  Lock,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'account'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Account password change state
  const [accountEmail, setAccountEmail] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    setAccountEmail(user?.email || 'admin@grandline.com');
  }, [user]);

  if (!settings) return null;

  const handleSaveProfileOrBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    try {
      if (!settings.name.trim()) {
        setSaveError('Restaurant name cannot be empty.');
        return;
      }

      saveSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save settings.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPass.length < 6) {
      setPassMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Save updated credentials to localStorage
    const updatedCreds = {
      email: accountEmail.trim(),
      password: newPass,
    };
    localStorage.setItem('tapsh_admin_creds', JSON.stringify(updatedCreds));

    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setPassMessage({ type: 'success', text: 'Administrator credentials updated successfully!' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 font-bold block mb-1">
            System Preferences & Identity
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Restaurant Settings
          </h1>
        </div>

        {/* Tab switchers */}
        <div className="bg-stone-200/80 p-1 rounded-xl flex items-center text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profile & Website</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'billing'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing & Tax</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'account'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff Account</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved! Public website and billing parameters have been updated.</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* TAB 1: RESTAURANT PROFILE & WEBSITE CONTENT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfileOrBilling} className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Restaurant Brand & Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Homepage Hero Introduction
              </label>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                About Us Story Narrative
              </label>
              <textarea
                rows={3}
                value={settings.story}
                onChange={(e) => setSettings({ ...settings, story: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Hero Background Photograph URL
              </label>
              <input
                type="url"
                value={settings.heroImageUrl}
                onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Location, Contact & Service Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Public Phone Number
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="text"
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Service Hours
                </label>
                <input
                  type="text"
                  value={settings.openingHours}
                  onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Full Physical Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Google Maps Directions URL
              </label>
              <input
                type="url"
                value={settings.googleMapsUrl}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Content Changes</span>
          </button>
        </form>
      )}

      {/* TAB 2: BILLING, TAX & THERMAL PRINTER SETTINGS */}
      {activeTab === 'billing' && (
        <form onSubmit={handleSaveProfileOrBilling} className="space-y-6">
          {/* Tax Configuration - Strict GST Disabled by default enforcement */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  GST & Tax Configuration
                </h3>
                <p className="text-xs text-stone-500">
                  Per the restaurant agreement, GST is disabled by default for the initial setup.
                </p>
              </div>

              {/* Strict GST Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.taxEnabled}
                  onChange={(e) => setSettings({ ...settings, taxEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {!settings.taxEnabled ? (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block">GST is Currently Disabled (Default)</span>
                <p>
                  No GST, CGST, SGST, IGST, or 0% tax rows will appear on bills or thermal receipts. Only Subtotal and Grand Total are displayed.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  Tax is enabled. Configured CGST and SGST percentages will be calculated on future invoices. (Previously issued invoices remain unchanged).
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                      CGST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.cgstPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cgstPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                      SGST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={settings.sgstPercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sgstPercent: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={settings.gstin}
                      onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thermal Printer TVS RP 3200 LITE Settings */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <Printer className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Thermal Receipt Printer (TVS RP 3200 LITE)
                </h3>
                <p className="text-xs text-stone-500">
                  Optimized for black-text thermal roll printing via standard Windows printer drivers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Thermal Paper Width
                </label>
                <select
                  value={settings.receiptPaperWidth}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      receiptPaperWidth: e.target.value as ReceiptPaperWidth,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm bg-white"
                >
                  <option value="80mm">80 mm (Standard TVS RP 3200 LITE roll)</option>
                  <option value="58mm">58 mm (Compact roll)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Receipt Header Lines
              </label>
              <textarea
                rows={2}
                value={settings.receiptHeader}
                onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Receipt Footer Greetings
              </label>
              <textarea
                rows={2}
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 text-sm font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Billing & Printer Parameters</span>
          </button>
        </form>
      )}

      {/* TAB 3: STAFF ACCOUNT CREDENTIALS */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs max-w-xl space-y-6">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Staff Account & Security
              </h3>
              <p className="text-xs text-stone-500">
                Update the administrator credentials for dashboard and POS access.
              </p>
            </div>
          </div>

          {passMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                passMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {passMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Administrator Email
              </label>
              <input
                type="email"
                required
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs uppercase tracking-wide shadow-sm active:scale-95"
            >
              Update Credentials
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
