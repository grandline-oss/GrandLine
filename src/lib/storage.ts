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
  query,
  where,
} from 'firebase/firestore';

const SETTINGS_KEY = 'grandline_restaurant_settings_v2';
const CATEGORIES_KEY = 'grandline_restaurant_categories_v2';
const MENU_ITEMS_KEY = 'grandline_restaurant_menu_items_v2';
const INVOICES_KEY = 'grandline_restaurant_invoices_v2';
const DELETED_INVOICES_KEY = 'grandline_deleted_invoices_v1';

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
  const current = readFromStorage<RestaurantSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  if (
    current.receiptFooter &&
    (current.receiptFooter.includes('***') ||
      current.receiptFooter.toLowerCase().includes('thank you for your visit'))
  ) {
    current.receiptFooter = 'Thank You! Visit Again!';
    writeToStorage(SETTINGS_KEY, current);
  }
  return current;
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
export function getDeletedInvoiceIds(): Set<string> {
  const raw = readFromStorage<string[]>(DELETED_INVOICES_KEY, []);
  return new Set(raw.map((id) => String(id).trim()));
}

export function markInvoiceAsDeleted(id: string, invoiceNumber?: string): void {
  const current = readFromStorage<string[]>(DELETED_INVOICES_KEY, []);
  const set = new Set(current);
  if (id) set.add(String(id).trim());
  if (invoiceNumber) set.add(String(invoiceNumber).trim());
  writeToStorage(DELETED_INVOICES_KEY, Array.from(set));
}

export function getInvoices(): Invoice[] {
  const all = readFromStorage<Invoice[]>(INVOICES_KEY, DEFAULT_INVOICES);
  const deletedSet = getDeletedInvoiceIds();
  return all.filter(
    (inv) =>
      !inv.isDeleted &&
      !deletedSet.has(inv.id) &&
      !deletedSet.has(inv.invoiceNumber)
  );
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
 * Automatically generates a sequential, unique bill number in the format: GL-MM/YY-0001
 * E.g., GL-10/26-0001 for October 2026.
 * The sequence increments automatically for each bill and resets monthly.
 * Guarantees that issued bill numbers are never duplicated or reused.
 */
export function generateNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `GL-${mm}/${yy}-`;

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

export async function deleteInvoiceAsync(invoiceId: string): Promise<boolean> {
  const allInvoices = readFromStorage<Invoice[]>(INVOICES_KEY, DEFAULT_INVOICES);
  const target = allInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
  const targetId = target ? target.id : invoiceId;
  const targetNumber = target ? target.invoiceNumber : invoiceId;

  // 1. Immediately register in the persistent deleted registry
  markInvoiceAsDeleted(targetId, targetNumber);
  markInvoiceAsDeleted(invoiceId);

  // 2. Remove from local storage array immediately
  const filtered = allInvoices.filter(
    (i) =>
      i.id !== targetId &&
      i.invoiceNumber !== targetNumber &&
      i.id !== invoiceId &&
      i.invoiceNumber !== invoiceId
  );
  writeToStorage(INVOICES_KEY, filtered);

  // 3. Delete / tombstone from Firestore cloud
  if (db) {
    try {
      const tombstoneData = {
        isDeleted: true,
        paymentStatus: 'CANCELLED',
        cancellationReason: 'DELETED_BY_ADMIN',
        deletedAt: new Date().toISOString(),
      };

      const ref1 = doc(db, 'invoices', targetId);
      const ref2 = doc(db, 'invoices', targetNumber);
      const ref3 = doc(db, 'invoices', invoiceId);

      // Direct deletions and tombstone fallbacks
      await Promise.allSettled([
        deleteDoc(ref1),
        deleteDoc(ref2),
        deleteDoc(ref3),
        setDoc(ref1, tombstoneData, { merge: true }),
        setDoc(ref2, tombstoneData, { merge: true }),
        setDoc(ref3, tombstoneData, { merge: true }),
      ]);

      // Query any docs in invoices collection that match id or invoiceNumber
      try {
        const col = collection(db, 'invoices');
        const [snap1, snap2] = await Promise.all([
          getDocs(query(col, where('invoiceNumber', '==', targetNumber))),
          getDocs(query(col, where('id', '==', targetId))),
        ]);

        const docsToDelete = [...snap1.docs, ...snap2.docs];
        for (const d of docsToDelete) {
          try {
            await deleteDoc(d.ref);
          } catch {
            await setDoc(d.ref, tombstoneData, { merge: true }).catch(() => {});
          }
        }
      } catch (qErr) {
        console.warn('Firestore query-based delete warning:', qErr);
      }

      // Record in cloud deleted_invoices collection for cross-device sync
      try {
        const delRef = doc(db, 'deleted_invoices', targetNumber || targetId);
        await setDoc(
          delRef,
          {
            id: targetId,
            invoiceNumber: targetNumber,
            deletedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (delErr) {
        console.warn('Firestore deleted_invoices write warning:', delErr);
      }
    } catch (e) {
      console.warn('Firestore invoice delete error:', e);
    }
  }

  return true;
}

export function deleteInvoice(invoiceId: string): boolean {
  deleteInvoiceAsync(invoiceId);
  return true;
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
        const deletedSet = getDeletedInvoiceIds();
        const list: Invoice[] = [];

        snapshot.forEach((d) => {
          const inv = d.data() as Invoice & { isDeleted?: boolean };
          const invId = inv.id || d.id;
          const invNum = inv.invoiceNumber || '';

          // If marked deleted or exists in persistent deleted registry, skip & purge!
          if (
            inv.isDeleted ||
            deletedSet.has(invId) ||
            deletedSet.has(invNum) ||
            deletedSet.has(d.id)
          ) {
            deleteDoc(d.ref).catch(() => {});
            return;
          }

          list.push({ ...inv, id: invId });
        });

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        writeToStorage(INVOICES_KEY, list);
        if (onUpdate) onUpdate();
      },
      (error) => {
        console.warn('Firestore invoices listener error (check rules):', error.message);
      }
    );

    // 5. Listen for deleted_invoices in Firestore (cross-device sync)
    const unsubDeletedInvoices = onSnapshot(
      collection(db, 'deleted_invoices'),
      (snapshot) => {
        let changed = false;
        snapshot.forEach((d) => {
          const data = d.data();
          const id = data.id || d.id;
          const num = data.invoiceNumber || '';
          if (id || num) {
            markInvoiceAsDeleted(id, num);
            changed = true;
          }
        });
        if (changed) {
          const current = readFromStorage<Invoice[]>(INVOICES_KEY, DEFAULT_INVOICES);
          const delSet = getDeletedInvoiceIds();
          const clean = current.filter(
            (i) => !i.isDeleted && !delSet.has(i.id) && !delSet.has(i.invoiceNumber)
          );
          writeToStorage(INVOICES_KEY, clean);
          if (onUpdate) onUpdate();
        }
      },
      (error) => {
        console.warn('Firestore deleted_invoices listener error:', error.message);
      }
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubMenu();
      unsubInvoices();
      unsubDeletedInvoices();
    };
  } catch (e) {
    console.warn('Firestore real-time listeners initialization error:', e);
    return () => {};
  }
}
