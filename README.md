# GrandLine — Restaurant Website & Management System
> Production-ready Restaurant Hospitality Website, POS Billing Counter & Management System. Built for high performance, mobile-first responsiveness, and TVS RP 3200 LITE thermal receipt printing.

---

## 🍽️ 1. Project Overview

- **Primary Brand:** GrandLine Fine Dine & Cafe (Restaurant-first branding throughout)
- **Developer Credit:** Website crafted by [TAPSH](https://tapsh.in/) (subtle, secondary footer credit)
- **Agreed Scope Budget:** ₹25,000
- **Client Equipment:** Windows computer / laptop + **TVS RP 3200 LITE** thermal receipt printer

---

## 🚀 2. Deliverables & Routes

### Public Website
- **Home (`/`)**: Striking animated hero section, chef's recommendations, heritage cooking philosophy, values, operating hours, and location highlights.
- **Menu (`/menu`)**: Dynamic database-driven menu browsing with live category filter pills, instant dish search, All / Veg / Non-Veg diet toggles, and Indian Rupee (₹) pricing.
- **About Us (`/about`)**: Story narrative, culinary philosophy, stone-ground spice heritage, and high-resolution ambiance imagery.
- **Contact (`/contact`)**: Physical address, direct telephone link, WhatsApp chat button, Google Maps directions, service hours, and table reservation inquiry form.

### Admin & POS Management Portal
- **Login (`/admin/login`)**: Secure staff & administrator authentication with clear validation.
  - *Default Credentials:* `admin@grandline.com` / `admin123` (editable in Settings)
- **Dashboard (`/admin`)**: Real-time sales metrics, today's completed bills, average bill value, payment-method summaries, 7-day sales SVG trend chart, and top-selling dishes.
- **POS Billing (`/admin/billing`)**: Fast counter billing interface for keyboard/touch operations. Search items, adjust quantities, calculate subtotal, integer paise precision, cash change calculation, and instant thermal receipt printing.
- **Menu Management (`/admin/menu`)**: Add/edit/deactivate dishes, upload/set image URLs, manage categories, set display order, and toggle stock availability.
- **Billing History (`/admin/history`)**: Searchable invoices by bill number, date, and payment mode. View immutable item snapshots, audit cancellations with recorded reasons, and reprint receipts without altering historical records.
- **Sales Reports (`/admin/reports`)**: Today, 7-day, 30-day, and custom period revenue reports, dish sales rankings, payment realization percentages, print-ready reports, and CSV exports.
- **Settings (`/admin/settings`)**:
  - *Restaurant Profile:* Name, tagline, description, address, phone, email, WhatsApp, and Google Maps URL.
  - *Billing & Tax:* GST/Tax toggle (**strictly disabled by default**), CGST/SGST rates, GSTIN, invoice prefix, and sequential counter.
  - *Printer Preferences:* TVS RP 3200 LITE paper width selection (58mm or 80mm), custom receipt header, and footer greetings.
  - *Staff Account:* Secure credential updates.

---

## 🧾 3. Thermal Receipt Printing (TVS RP 3200 LITE)

The application includes dedicated print styling (`@media print`) engineered specifically for the client's **TVS RP 3200 LITE**:

- **Thermal Technology:** Pure black text on white background (no colored ink assumptions).
- **Paper Roll Widths:** Configurable between standard **80 mm** and compact **58 mm** in Settings.
- **Clean Layout:** Automatic suppression of headers, sidebars, buttons, and browser UI elements during printing.
- **Invoice Re-printing:** Any completed bill can be reprinted from Billing History at any time with exact original snapshots and timestamps.
- **Windows Setup:** Uses standard Windows printer drivers via browser `window.print()` with zero third-party subscription bridges needed.

---

## ⚖️ 4. GST & Tax Configuration

- **Default Configuration:** GST is **disabled by default**.
- When disabled:
  - No GST, CGST, SGST, IGST, or 0% rows are displayed.
  - Subtotal and Grand Total are displayed cleanly.
- If the restaurant enables tax in Settings &rarr; Billing:
  - CGST and SGST percentages are applied dynamically to new bills.
  - Historical invoices strictly preserve their original tax configuration.

---

## 💻 5. Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) with TypeScript & React 19
- **Styling:** Modern Tailwind CSS + Print-specific CSS media queries
- **Icons:** Lucide React
- **Data Persistence:** Dual-mode unified repository (`src/lib/storage.ts`)
  - Out-of-the-box local storage engine with realistic initial seed data.
  - Cloud Firestore / Firebase Auth adapter ready (`src/lib/firebase.ts`) for multi-terminal cloud sync.
- **Financial Arithmetic:** Integer paise calculations (`src/lib/currency.ts`) guaranteeing zero floating-point rounding errors.

---

## 🛠️ 6. Quick Start & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

4. **Staff Login:**
   - URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - Email: `admin@grandline.com`
   - Password: `admin123`

---

## ☁️ 7. Optional Firebase Configuration

To enable live multi-device database synchronization across multiple cash registers or remote devices:
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Copy `.env.example` to `.env.local`
3. Fill in your Firebase Web App credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
