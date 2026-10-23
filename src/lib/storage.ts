import {
  RestaurantSettings,
  Category,
  MenuItem,
  Invoice,
  InvoiceItemSnapshot,
  PaymentMethod,
} from './types';
import { calculateBill } from './currency';
import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

const SETTINGS_KEY = 'grandline_restaurant_settings_v2';
const CATEGORIES_KEY = 'grandline_restaurant_categories_v2';
const MENU_ITEMS_KEY = 'grandline_restaurant_menu_items_v2';
const INVOICES_KEY = 'grandline_restaurant_invoices_v2';

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantId: 'grandline_main',
  name: 'GRAND LINE CAFÉ & RESTAURANT',
  tagline: 'YOUR JOURNEY BEGINS HERE',
  description: '',
  story: '',
  philosophy: '',
  address: '',
  phone: '',
  email: 'grandlinecaferestaurant@gmail.com',
  whatsapp: '',
  openingHours: '',
  googleMapsUrl: '',
  logoUrl: '/brand/grand-line-logo.jpg',
  heroImageUrl: '',
  currency: 'INR',
  currencySymbol: '₹',
  invoicePrefix: 'GL-',
  nextInvoiceNumber: 1,
  taxEnabled: false, // GST disabled by default
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  gstin: '',
  discountEnabled: true,
  receiptHeader: '',
  receiptFooter: 'Thank You! Visit Again!',
  receiptPaperWidth: '80mm',
  acceptedPaymentMethods: ['CASH', 'UPI', 'CARD', 'OTHER'],
  updatedAt: new Date().toISOString(),
};

// ZERO initial dummy data per user requirement until admin creates them
export const DEFAULT_CATEGORIES: Category[] = [];
export const DEFAULT_MENU_ITEMS: MenuItem[] = [];
export const DEFAULT_INVOICES: Invoice[] = [];

// Helper to safely read from localStorage
function readFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('grandline_sync', { detail: { key } }));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// ---------------- RESTAURANT SETTINGS ----------------
export function getSettings(): RestaurantSettings {
  return readFromStorage<RestaurantSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings: RestaurantSettings): RestaurantSettings {
  const updated = { ...settings, updatedAt: new Date().toISOString() };
  writeToStorage(SETTINGS_KEY, updated);

  // Sync to Cloud Firestore if connected
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'restaurant');
      setDoc(docRef, updated, { merge: true }).catch((err) =>
        console.warn('Firestore settings sync pending:', err)
      );
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }
  }

  return updated;
}

// ---------------- CATEGORIES ----------------
export function getCategories(): Category[] {
  return readFromStorage<Category[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

export function saveCategories(categories: Category[]): void {
  writeToStorage(CATEGORIES_KEY, categories);
}

export function saveCategory(category: Category): Category {
  const current = getCategories();
  const index = current.findIndex((c) => c.id === category.id);
  let updatedList: Category[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = category;
  } else {
    updatedList = [...current, category];
  }
  saveCategories(updatedList);

  if (db) {
    try {
      const docRef = doc(db, 'categories', category.id);
      setDoc(docRef, category, { merge: true }).catch((err) =>
        console.warn('Firestore category sync pending:', err)
      );
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }
  }

  return category;
}

export function deleteCategory(id: string): void {
  const current = getCategories();
  saveCategories(current.filter((c) => c.id !== id));

  if (db) {
    try {
      const docRef = doc(db, 'categories', id);
      deleteDoc(docRef).catch((err) => console.warn('Firestore delete category error:', err));
    } catch (e) {
      console.warn('Firestore delete error:', e);
    }
  }
}

// ---------------- MENU ITEMS ----------------
export function getMenuItems(): MenuItem[] {
  return readFromStorage<MenuItem[]>(MENU_ITEMS_KEY, DEFAULT_MENU_ITEMS);
}

export function saveMenuItems(items: MenuItem[]): void {
  writeToStorage(MENU_ITEMS_KEY, items);
}

export function saveMenuItem(item: MenuItem): MenuItem {
  const current = getMenuItems();
  const index = current.findIndex((i) => i.id === item.id);
  const now = new Date().toISOString();
  let updatedItem: MenuItem;
  let updatedList: MenuItem[];

  if (index >= 0) {
    updatedItem = { ...item, updatedAt: now };
    updatedList = [...current];
    updatedList[index] = updatedItem;
  } else {
    updatedItem = {
      ...item,
      id: item.id || `item_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    updatedList = [...current, updatedItem];
  }
  saveMenuItems(updatedList);

  if (db) {
    try {
      const docRef = doc(db, 'menuItems', updatedItem.id);
      setDoc(docRef, updatedItem, { merge: true }).catch((err) =>
        console.warn('Firestore menu sync pending:', err)
      );
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }
  }

  return updatedItem;
}

export function toggleMenuItemAvailability(id: string): MenuItem | null {
  const current = getMenuItems();
  const index = current.findIndex((i) => i.id === id);
  if (index < 0) return null;
  const item = { ...current[index], isAvailable: !current[index].isAvailable, updatedAt: new Date().toISOString() };
  current[index] = item;
  saveMenuItems(current);

  if (db) {
    try {
      const docRef = doc(db, 'menuItems', id);
      setDoc(docRef, item, { merge: true }).catch((err) => console.warn(err));
    } catch (e) {
      console.warn(e);
    }
  }

  return item;
}

export function deleteMenuItem(id: string): void {
  const current = getMenuItems();
  saveMenuItems(current.filter((i) => i.id !== id));

  if (db) {
    try {
      const docRef = doc(db, 'menuItems', id);
      deleteDoc(docRef).catch((err) => console.warn(err));
    } catch (e) {
      console.warn(e);
    }
  }
}

// ---------------- INVOICES & BILLING ----------------
export function getInvoices(): Invoice[] {
  return readFromStorage<Invoice[]>(INVOICES_KEY, DEFAULT_INVOICES);
}

export function getInvoiceById(id: string): Invoice | null {
  const invoices = getInvoices();
  return invoices.find((inv) => inv.id === id || inv.invoiceNumber === id) || null;
}

export interface CreateInvoiceParams {
  items: {
    itemId: string;
    quantity: number;
  }[];
  discountPercent?: number;
  paymentMethod: PaymentMethod;
  amountReceivedPaise?: number;
  cashierName?: string;
}

/**
 * Automatically generates a sequential, unique bill number in the format: GL-MMYY-0001
 * E.g., GL-1026-0001 for October 2026.
 * Guarantees that issued bill numbers are never duplicated or reused.
 */
export function generateNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `GL-${mm}${yy}-`;

  let maxSeq = 0;
  for (const inv of existingInvoices) {
    if (inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix)) {
      const parts = inv.invoiceNumber.split('-');
      const numPart = parts[parts.length - 1];
      const seq = parseInt(numPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;

  const existingNumbers = new Set(existingInvoices.map((inv) => inv.invoiceNumber));
  while (existingNumbers.has(candidate)) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  return candidate;
}

export function createInvoice(params: CreateInvoiceParams): { success: boolean; invoice?: Invoice; error?: string } {
  try {
    const settings = getSettings();
    const menuItems = getMenuItems();

    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Cannot create an invoice with an empty cart.' };
    }

    const calculationItems = params.items.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.itemId);
      if (!menuItem) {
        throw new Error(`Item is no longer available in the menu.`);
      }
      return {
        itemId: menuItem.id,
        name: menuItem.name,
        quantity: cartItem.quantity,
        unitPricePaise: menuItem.pricePaise,
      };
    });

    const calc = calculateBill(
      calculationItems,
      params.discountPercent || 0,
      settings.taxEnabled,
      settings.cgstPercent,
      settings.sgstPercent
    );

    const existingInvoices = getInvoices();
    const invoiceNumber = generateNextInvoiceNumber(existingInvoices);

    let changeDuePaise: number | undefined = undefined;
    if (params.paymentMethod === 'CASH' && params.amountReceivedPaise !== undefined) {
      changeDuePaise = Math.max(0, params.amountReceivedPaise - calc.grandTotalPaise);
    }

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      items: calc.items,
      subtotalPaise: calc.subtotalPaise,
      discountPaise: calc.discountPaise,
      discountPercent: calc.discountPercent,
      taxPaise: calc.taxPaise,
      taxBreakdown: calc.taxBreakdown,
      grandTotalPaise: calc.grandTotalPaise,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'COMPLETED',
      amountReceivedPaise: params.amountReceivedPaise,
      changeDuePaise,
      cashierName: params.cashierName || 'Admin / Cashier',
    };

    writeToStorage(INVOICES_KEY, [newInvoice, ...existingInvoices]);

    if (db) {
      try {
        const docRef = doc(db, 'invoices', newInvoice.id);
        setDoc(docRef, newInvoice).catch((err) =>
          console.warn('Firestore invoice sync pending:', err)
        );
      } catch (e) {
        console.warn('Firestore sync error:', e);
      }
    }

    return { success: true, invoice: newInvoice };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown billing error occurred';
    return { success: false, error: message };
  }
}

export function cancelInvoice(invoiceId: string, reason: string): Invoice | null {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === invoiceId);
  if (index < 0) return null;

  const invoice = invoices[index];
  if (invoice.paymentStatus === 'CANCELLED') return invoice;

  const updated: Invoice = {
    ...invoice,
    paymentStatus: 'CANCELLED',
    cancellationReason: reason,
    cancelledAt: new Date().toISOString(),
  };

  invoices[index] = updated;
  writeToStorage(INVOICES_KEY, invoices);

  if (db) {
    try {
      const docRef = doc(db, 'invoices', invoiceId);
      setDoc(docRef, updated, { merge: true }).catch((err) => console.warn(err));
    } catch (e) {
      console.warn(e);
    }
  }

  return updated;
}

/**
 * Initializes Firestore cloud listeners to keep data in sync across all screens
 */
export function initFirestoreSync(onUpdate?: () => void): () => void {
  if (!db) return () => {};

  try {
    // 1. Listen for settings updates
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'restaurant'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as RestaurantSettings;
          writeToStorage(SETTINGS_KEY, data);
          if (onUpdate) onUpdate();
        }
      },
      (error) => {
        console.warn('Firestore settings listener error (check rules):', error.message);
      }
    );

    // 2. Listen for categories
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const list: Category[] = [];
        snapshot.forEach((d) => list.push(d.data() as Category));
        list.sort((a, b) => a.displayOrder - b.displayOrder);
        writeToStorage(CATEGORIES_KEY, list);
        if (onUpdate) onUpdate();
      },
      (error) => {
        console.warn('Firestore categories listener error (check rules):', error.message);
      }
    );

    // 3. Listen for menu items
    const unsubMenu = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const list: MenuItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as MenuItem));
        writeToStorage(MENU_ITEMS_KEY, list);
        if (onUpdate) onUpdate();
      },
      (error) => {
        console.warn('Firestore menu items listener error (check rules):', error.message);
      }
    );

    // 4. Listen for invoices
    const unsubInvoices = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        const list: Invoice[] = [];
        snapshot.forEach((d) => list.push(d.data() as Invoice));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        writeToStorage(INVOICES_KEY, list);
        if (onUpdate) onUpdate();
      },
      (error) => {
        console.warn('Firestore invoices listener error (check rules):', error.message);
      }
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubMenu();
      unsubInvoices();
    };
  } catch (e) {
    console.warn('Firestore real-time listeners initialization error:', e);
    return () => {};
  }
}
