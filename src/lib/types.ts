export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'OTHER';
export type InvoiceStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type ReceiptPaperWidth = '58mm' | '80mm';

export interface RestaurantSettings {
  restaurantId: string;
  name: string;
  tagline: string;
  description: string;
  story: string;
  philosophy: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  openingHours: string;
  googleMapsUrl: string;
  logoUrl: string;
  heroImageUrl: string;
  currency: string;
  currencySymbol: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  taxEnabled: boolean; // MUST be false by default
  cgstPercent: number;
  sgstPercent: number;
  gstin: string;
  discountEnabled: boolean;
  receiptHeader: string;
  receiptFooter: string;
  receiptPaperWidth: ReceiptPaperWidth;
  acceptedPaymentMethods: PaymentMethod[];
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  pricePaise: number; // Stored in integer paise (e.g. 24000 = ₹240.00)
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isVeg?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemSnapshot {
  itemId: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
}

export interface TaxBreakdown {
  cgstPaise: number;
  sgstPaise: number;
  totalTaxPaise: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  items: InvoiceItemSnapshot[];
  subtotalPaise: number;
  discountPaise: number;
  discountPercent?: number;
  taxPaise: number;
  taxBreakdown?: TaxBreakdown;
  grandTotalPaise: number;
  paymentMethod: PaymentMethod;
  paymentStatus: InvoiceStatus;
  amountReceivedPaise?: number;
  changeDuePaise?: number;
  cancellationReason?: string;
  cancelledAt?: string;
  cashierName?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'cashier';
}
