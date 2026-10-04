# 🌱 ANNADATA NURSERY – Nursery Management System

**Tagline:** *Quality Seedlings • Better Yield • Farmer Trust*

A complete, production-quality full-stack web application built specifically for seedling nurseries selling plants like Tomato, Mirchi, Brinjal, and other varieties to farmers.

---

## 🚀 Key Features

1. **Dashboard & Analytics:**
   - Real-time KPIs: Today's Sales, Total Seedlings Stock Grown, Remaining Available Stock, Customer Pending Balances.
   - Sales overview charts, Payment Breakdown (Cash / UPI / Credit), Stock breakdown by plant type.
   - Low Stock Alerts and Ready-to-Sell batches widgets.

2. **Stock Management:**
   - Plant & Variety Management (Tomato, Mirchi, Brinjal, Cabbage, and dynamic additions).
   - Batch-level tracking (Batch #, Sowing Date, Ready Date, Initial Qty, Sold Qty, Wastage, Available Qty = `Initial - Sold - Wastage`).
   - Dedicated Wastage recording module.

3. **POS Billing Module:**
   - Quick Customer Selection / Quick Farmer Registration.
   - Multi-item line selector with live stock checks stopping over-selling.
   - Subtotal, Discount, Grand Total, Paid Amount, and Pending Balance auto-calculation.
   - Instant receipt printing & WhatsApp bill sharing.

4. **Farmer Customer Directory:**
   - Complete profiles, total purchases, paid amounts, and pending balance tracking.
   - Record payment module linked to bills or general account.
   - Customer purchase & payment history statements.

5. **Expense Management:**
   - Track operational expenses (Seeds, Fertilizer, Labour, Transportation, Electricity, Water, Packaging, Maintenance, Other).

6. **Reports & Profit/Loss Statement:**
   - Daily Sales, Monthly Sales, Variety-wise Sales.
   - Profit / Loss calculation (`Total Sales - Total Expenses`).
   - Customer Outstanding Report with 1-click WhatsApp payment reminders.

7. **Excel Export:**
   - Export `ANNADATA_Customers.xlsx` (Customers, Transactions, Payments sheets).
   - Export Stock and Expense reports via SheetJS (`xlsx`).

---

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Recharts, Lucide React, Axios, SheetJS (`xlsx`).
- **Backend:** Node.js, Express.js, Mongoose, bcryptjs, jsonwebtoken, SheetJS (`xlsx`).
- **Database:** MongoDB (with automatic MongoMemoryServer fallback for zero-configuration testing out of the box).

---

## 🔑 Demo Admin Credentials

- **Email:** `admin@annadata.com`
- **Password:** `admin123`

---

## ⚙️ How to Run Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
*Note: On first start, the database will automatically run the seed script populating plants, varieties, stock batches, sample customers, bills, and expenses.*

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
