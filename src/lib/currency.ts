import { InvoiceItemSnapshot, TaxBreakdown } from './types';

/**
 * Converts integer paise to decimal rupees.
 * e.g., 25000 paise -> 250.00
 */
export function paiseToRupees(paise: number): number {
  return Number((paise / 100).toFixed(2));
}

/**
 * Converts decimal rupees into integer paise.
 * e.g., 250.50 -> 25050
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Formats integer paise into Indian Rupee (₹) standard currency display.
 * Uses Indian numbering grouping (lakhs/crores) where appropriate.
 */
export function formatInr(paise: number, includeSymbol = true, showDecimals = true): string {
  const rupees = paise / 100;
  const formatted = rupees.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return includeSymbol ? `₹${formatted}` : formatted;
}

export interface CalculationInputItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
}

export interface BillCalculationResult {
  items: InvoiceItemSnapshot[];
  subtotalPaise: number;
  discountPercent: number;
  discountPaise: number;
  taxEnabled: boolean;
  taxPaise: number;
  taxBreakdown?: TaxBreakdown;
  grandTotalPaise: number;
}

/**
 * Computes line totals and totals using integer paise arithmetic.
 * Ensures zero floating-point imprecision in financial records.
 * STRICT: If taxEnabled is false, tax is 0 and taxBreakdown is undefined.
 */
export function calculateBill(
  items: CalculationInputItem[],
  discountPercent: number = 0,
  taxEnabled: boolean = false,
  cgstPercent: number = 2.5,
  sgstPercent: number = 2.5
): BillCalculationResult {
  const itemSnapshots: InvoiceItemSnapshot[] = items.map((item) => {
    const qty = Math.max(1, Math.floor(item.quantity));
    const unitPrice = Math.max(0, Math.floor(item.unitPricePaise));
    const lineTotal = unitPrice * qty;
    return {
      itemId: item.itemId,
      name: item.name,
      quantity: qty,
      unitPricePaise: unitPrice,
      lineTotalPaise: lineTotal,
    };
  });

  const subtotalPaise = itemSnapshots.reduce((acc, curr) => acc + curr.lineTotalPaise, 0);

  // Discount calculation
  const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
  const discountPaise = clampedDiscount > 0 ? Math.round((subtotalPaise * clampedDiscount) / 100) : 0;
  const taxableSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);

  let taxPaise = 0;
  let taxBreakdown: TaxBreakdown | undefined = undefined;

  // ONLY compute taxes if taxEnabled is explicitly true
  if (taxEnabled && taxableSubtotalPaise > 0) {
    const cgstPaise = Math.round((taxableSubtotalPaise * cgstPercent) / 100);
    const sgstPaise = Math.round((taxableSubtotalPaise * sgstPercent) / 100);
    taxPaise = cgstPaise + sgstPaise;
    taxBreakdown = {
      cgstPaise,
      sgstPaise,
      totalTaxPaise: taxPaise,
    };
  }

  const grandTotalPaise = taxableSubtotalPaise + taxPaise;

  return {
    items: itemSnapshots,
    subtotalPaise,
    discountPercent: clampedDiscount,
    discountPaise,
    taxEnabled,
    taxPaise,
    taxBreakdown,
    grandTotalPaise,
  };
}
