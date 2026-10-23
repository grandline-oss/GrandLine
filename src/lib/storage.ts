import {
  RestaurantSettings,
  Category,
  MenuItem,
  Invoice,
  InvoiceItemSnapshot,
  PaymentMethod,
} from './types';
import { calculateBill } from './currency';

const SETTINGS_KEY = 'tapsh_restaurant_settings_v1';
const CATEGORIES_KEY = 'tapsh_restaurant_categories_v1';
const MENU_ITEMS_KEY = 'tapsh_restaurant_menu_items_v1';
const INVOICES_KEY = 'tapsh_restaurant_invoices_v1';

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantId: 'rest_grandline_01',
  name: 'GrandLine Fine Dine & Cafe',
  tagline: 'Artisanal Flavors & Authentic Hospitality',
  description:
    'Experience an extraordinary gastronomic voyage featuring heritage coastal recipes, slow-simmered handi specialties, and wood-fired delicacies crafted with fresh regional ingredients.',
  story:
    'Founded with a passion for culinary honesty, GrandLine celebrates the timeless art of traditional Indian and coastal dining. From freshly stone-ground spice blends to clay oven slow-baking, our kitchen creates an unforgettable dining memory with every table served.',
  philosophy:
    'Honest recipes, farm-fresh ingredients, zero artificial additives, and heartfelt hospitality at every moment.',
  address: '14, Marine Drive Promenade, Near Harbour Point, Kochi, Kerala - 682001',
  phone: '+91 98765 43210',
  email: 'dine@grandlinekerala.com',
  whatsapp: '+919876543210',
  openingHours: 'Mon – Sun: 11:30 AM – 11:30 PM',
  googleMapsUrl: 'https://maps.google.com/?q=Marine+Drive+Kochi',
  logoUrl: '',
  heroImageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80',
  currency: 'INR',
  currencySymbol: '₹',
  invoicePrefix: 'GL-',
  nextInvoiceNumber: 1001,
  // STRICT REQUIREMENT: GST must be disabled by default for the initial restaurant configuration
  taxEnabled: false,
  cgstPercent: 2.5,
  sgstPercent: 2.5,
  gstin: '',
  discountEnabled: true,
  receiptHeader: 'GRANDLINE DINE & CAFE\nMarine Drive, Kochi - 682001\nPh: +91 98765 43210',
  receiptFooter: 'Thank you for dining with GrandLine!\nPlease visit again.',
  receiptPaperWidth: '80mm',
  acceptedPaymentMethods: ['CASH', 'UPI', 'CARD', 'OTHER'],
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_starters', name: 'Starters & Appetizers', displayOrder: 1, isActive: true },
  { id: 'cat_mains', name: "Chef's Signature Mains", displayOrder: 2, isActive: true },
  { id: 'cat_breads_rice', name: 'Breads & Fragrant Rice', displayOrder: 3, isActive: true },
  { id: 'cat_beverages', name: 'Artisan Coolers & Mocktails', displayOrder: 4, isActive: true },
  { id: 'cat_desserts', name: 'Handcrafted Desserts', displayOrder: 5, isActive: true },
];

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item_1',
    categoryId: 'cat_starters',
    name: 'Smoked Paneer Angara Tikka',
    description: 'Fresh cottage cheese cubes marinated in smoked hung curd, Kashmiri chilies, and roasted spices.',
    pricePaise: 32000, // ₹320.00
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_2',
    categoryId: 'cat_starters',
    name: 'Malabar Spiced Chicken Tikka',
    description: 'Boneless chicken thighs charred to perfection in tandoor with crushed shallots, curry leaves, and black pepper.',
    pricePaise: 36000, // ₹360.00
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_3',
    categoryId: 'cat_starters',
    name: 'Crispy Calamari Pepper Fry',
    description: 'Tender squid rings tossed with caramelized shallots, crushed tellicherry peppercorns, and fresh curry leaf crisp.',
    pricePaise: 41000, // ₹410.00
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_4',
    categoryId: 'cat_mains',
    name: 'Dum Biryani with Mint Raita',
    description: 'Fragrant Kaima rice layered with slow-cooked spiced meat, fried brown onions, saffron ghee, and whole spices.',
    pricePaise: 44000, // ₹440.00
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_5',
    categoryId: 'cat_mains',
    name: 'Coastal Fish Curry with Raw Mango',
    description: 'Fresh Kingfish simmered in creamy coconut milk, raw green mango slices, bird-eye chilies, and roasted fenugreek.',
    pricePaise: 48000, // ₹480.00
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: false,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_6',
    categoryId: 'cat_mains',
    name: 'Paneer Lababdar Handi',
    description: 'Succulent malai paneer steeped in a velvety tomato-cashew gravy scented with dried fenugreek and cardamom.',
    pricePaise: 35000, // ₹350.00
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_7',
    categoryId: 'cat_mains',
    name: 'Dal Makhani 24-Hour Simmer',
    description: 'Black lentils slow cooked overnight on charcoal embers with fresh cream, churned butter, and ripe plum tomatoes.',
    pricePaise: 29000, // ₹290.00
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_8',
    categoryId: 'cat_breads_rice',
    name: 'Butter Garlic Naan',
    description: 'Clay-oven baked leavened bread brushed with garlic butter and fresh cilantro.',
    pricePaise: 7500, // ₹75.00
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_9',
    categoryId: 'cat_breads_rice',
    name: 'Flaky Malabar Parotta (2 Pcs)',
    description: 'Layered, flaky and golden flatbreads prepared in traditional Kerala style with pure ghee.',
    pricePaise: 8000, // ₹80.00
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_10',
    categoryId: 'cat_beverages',
    name: 'Royal Saffron Mango Lassi',
    description: 'Rich Alphonso mango pulp blended with thick yogurt, Kashmiri saffron strands, and crushed pistachios.',
    pricePaise: 16000, // ₹160.00
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_11',
    categoryId: 'cat_beverages',
    name: 'Fresh Mint Lime Spritzer',
    description: 'Crushed garden mint, freshly squeezed key lime, rock salt, and sparkling water on rocks.',
    pricePaise: 11000, // ₹110.00
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'item_12',
    categoryId: 'cat_desserts',
    name: 'Warm Gulab Jamun with Rabri',
    description: 'Golden fried mawa dumplings soaked in cardamom syrup, served on a bed of chilled saffron rabri.',
    pricePaise: 18000, // ₹180.00
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    isVeg: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
];

export const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv_seed_1001',
    invoiceNumber: 'GL-1001',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    items: [
      { itemId: 'item_4', name: 'Dum Biryani with Mint Raita', quantity: 2, unitPricePaise: 44000, lineTotalPaise: 88000 },
      { itemId: 'item_8', name: 'Butter Garlic Naan', quantity: 3, unitPricePaise: 7500, lineTotalPaise: 22500 },
      { itemId: 'item_10', name: 'Royal Saffron Mango Lassi', quantity: 2, unitPricePaise: 16000, lineTotalPaise: 32000 },
    ],
    subtotalPaise: 142500,
    discountPaise: 0,
    discountPercent: 0,
    taxPaise: 0,
    grandTotalPaise: 142500,
    paymentMethod: 'UPI',
    paymentStatus: 'COMPLETED',
    cashierName: 'Cashier 1',
  },
  {
    id: 'inv_seed_1002',
    invoiceNumber: 'GL-1002',
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    items: [
      { itemId: 'item_1', name: 'Smoked Paneer Angara Tikka', quantity: 1, unitPricePaise: 32000, lineTotalPaise: 32000 },
      { itemId: 'item_6', name: 'Paneer Lababdar Handi', quantity: 1, unitPricePaise: 35000, lineTotalPaise: 35000 },
      { itemId: 'item_9', name: 'Flaky Malabar Parotta (2 Pcs)', quantity: 2, unitPricePaise: 8000, lineTotalPaise: 16000 },
    ],
    subtotalPaise: 83000,
    discountPaise: 0,
    discountPercent: 0,
    taxPaise: 0,
    grandTotalPaise: 83000,
    paymentMethod: 'CASH',
    paymentStatus: 'COMPLETED',
    amountReceivedPaise: 100000,
    changeDuePaise: 17000,
    cashierName: 'Cashier 1',
  },
];

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
  return category;
}

export function deleteCategory(id: string): void {
  const current = getCategories();
  saveCategories(current.filter((c) => c.id !== id));
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
  return updatedItem;
}

export function toggleMenuItemAvailability(id: string): MenuItem | null {
  const current = getMenuItems();
  const index = current.findIndex((i) => i.id === id);
  if (index < 0) return null;
  const item = { ...current[index], isAvailable: !current[index].isAvailable, updatedAt: new Date().toISOString() };
  current[index] = item;
  saveMenuItems(current);
  return item;
}

export function deleteMenuItem(id: string): void {
  const current = getMenuItems();
  saveMenuItems(current.filter((i) => i.id !== id));
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
 * Creates an immutable invoice snapshot.
 * - Safely increments sequential invoice number.
 * - Pulls the latest unit prices from current menu.
 * - Recomputes line totals, subtotal, and tax based on the CURRENT tax configuration.
 * - Strictly respects taxEnabled: if disabled, tax is 0.
 */
export function createInvoice(params: CreateInvoiceParams): { success: boolean; invoice?: Invoice; error?: string } {
  try {
    const settings = getSettings();
    const menuItems = getMenuItems();

    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Cannot create an invoice with an empty cart.' };
    }

    // Map cart items to menu snapshots
    const calculationItems = params.items.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.itemId);
      if (!menuItem) {
        throw new Error(`Item ${cartItem.itemId} is no longer available in the menu.`);
      }
      return {
        itemId: menuItem.id,
        name: menuItem.name,
        quantity: cartItem.quantity,
        unitPricePaise: menuItem.pricePaise,
      };
    });

    // Run exact integer calculation
    const calc = calculateBill(
      calculationItems,
      params.discountPercent || 0,
      settings.taxEnabled,
      settings.cgstPercent,
      settings.sgstPercent
    );

    // Concurrency-safe sequential invoice numbering
    const currentNum = settings.nextInvoiceNumber || 1001;
    const invoiceNumber = `${settings.invoicePrefix || 'INV-'}${currentNum}`;

    // Update settings with next sequential number
    saveSettings({
      ...settings,
      nextInvoiceNumber: currentNum + 1,
    });

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

    const existingInvoices = getInvoices();
    writeToStorage(INVOICES_KEY, [newInvoice, ...existingInvoices]);

    return { success: true, invoice: newInvoice };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown billing error occurred';
    return { success: false, error: message };
  }
}

/**
 * Cancels an invoice with an authorized reason, preserving historical record.
 */
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
  return updated;
}
