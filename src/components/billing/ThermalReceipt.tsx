'use client';

import React from 'react';
import { Invoice, RestaurantSettings } from '@/lib/types';
import { formatInr } from '@/lib/currency';

interface ThermalReceiptProps {
  invoice: Invoice;
  settings: RestaurantSettings;
  onClose?: () => void;
  autoPrint?: boolean;
  hideControls?: boolean;
}

export default function ThermalReceipt({
  invoice,
  settings,
  onClose,
  autoPrint = false,
  hideControls = false,
}: ThermalReceiptProps) {
  React.useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const paperWidthClass =
    settings.receiptPaperWidth === '58mm' ? 'max-w-[58mm]' : 'max-w-[80mm]';

  const invoiceDateObj = new Date(invoice.createdAt);
  const formattedDate = invoiceDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = invoiceDateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div>
      {/* On-screen control bar (Hidden during printing or if hideControls is true) */}
      {!hideControls && (
        <div className="no-print mb-4 p-4 rounded-xl bg-stone-900 text-white flex items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
            Thermal Receipt Preview ({settings.receiptPaperWidth})
          </span>
          <span className="text-sm text-stone-300">
            Invoice: <strong className="text-white">{invoice.invoiceNumber}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Print Receipt (TVS RP 3200 LITE)
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
            >
              Close Preview
            </button>
          )}
        </div>
      </div>
      )}

      {/* The Printable Thermal Receipt Container */}
      <div
        className={`thermal-receipt-container mx-auto bg-white text-black font-mono text-[12px] leading-tight p-2 border border-stone-300 shadow-sm print:border-none print:shadow-none ${paperWidthClass}`}
        style={{ color: '#000000', backgroundColor: '#ffffff' }}
      >
        {/* Header Section */}
        <div className="text-center pb-2 border-b border-black border-dashed">
          <h2 className="text-sm font-bold uppercase tracking-tight leading-snug">
            {settings.name}
          </h2>
          {settings.receiptHeader ? (
            <p className="whitespace-pre-line text-[11px] text-black/90 mt-0.5">
              {settings.receiptHeader}
            </p>
          ) : (
            <p className="text-[11px] text-black/90 mt-0.5">
              {settings.address}
            </p>
          )}
          {settings.phone && (
            <p className="text-[11px]">Tel: {settings.phone}</p>
          )}
          {/* Only display GSTIN if tax is explicitly enabled and gstin is present */}
          {settings.taxEnabled && settings.gstin && (
            <p className="text-[11px] font-bold">GSTIN: {settings.gstin}</p>
          )}
        </div>

        {/* Invoice Meta */}
        <div className="py-2 border-b border-black border-dashed text-[11px] space-y-1">
          <div className="flex justify-between items-center">
            <span>Bill No: <strong>{invoice.invoiceNumber}</strong></span>
            <span>Pay Mode: <strong>{invoice.paymentMethod}</strong></span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>Date: <strong>{formattedDate}</strong></span>
            <span>Time: <strong>{formattedTime}</strong></span>
          </div>
          {invoice.paymentStatus !== 'COMPLETED' && (
            <div className="text-center font-bold uppercase mt-1 text-[11px] border border-black p-0.5">
              Status: {invoice.paymentStatus}
            </div>
          )}
        </div>

        {/* Item Table */}
        <div className="py-2 border-b border-black border-dashed">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-black">
                <th className="py-1 font-bold text-left w-1/2">Item</th>
                <th className="py-1 font-bold text-center w-1/6">Qty</th>
                <th className="py-1 font-bold text-right w-1/6">Rate</th>
                <th className="py-1 font-bold text-right w-1/6">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={`${item.itemId}_${idx}`} className="align-top">
                  <td className="py-1 pr-1 break-words font-medium">{item.name}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-right">{formatInr(item.unitPricePaise, false)}</td>
                  <td className="py-1 text-right font-semibold">{formatInr(item.lineTotalPaise, false)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="py-2 border-b border-black border-dashed text-[11px] space-y-1">
          {/* Subtotal and GST breakdown only rendered if tax is enabled */}
          {invoice.taxPaise > 0 && invoice.taxBreakdown && (
            <>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatInr(invoice.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST:</span>
                <span>{formatInr(invoice.taxBreakdown.cgstPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST:</span>
                <span>{formatInr(invoice.taxBreakdown.sgstPaise)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between text-[13px] font-bold pt-1 border-t border-black">
            <span>GRAND TOTAL:</span>
            <span>{formatInr(invoice.grandTotalPaise)}</span>
          </div>

          {/* Cash calculations */}
          {invoice.paymentMethod === 'CASH' && invoice.amountReceivedPaise !== undefined && (
            <div className="pt-1 text-[11px] border-t border-black border-dotted space-y-0.5">
              <div className="flex justify-between">
                <span>Cash Received:</span>
                <span>{formatInr(invoice.amountReceivedPaise)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Change Returned:</span>
                <span>{formatInr(invoice.changeDuePaise || 0)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="text-center pt-3 text-[11px] font-bold tracking-wide">
          <p>Thank You! Visit Again!</p>
        </div>
      </div>
    </div>
  );
}
