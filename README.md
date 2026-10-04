# 🌱 ANNADATA NURSERY – Nursery Management System

**Tagline:** *Quality Seedlings • Better Yield • Farmer Trust*

A full-stack, production-quality Nursery Management System built specifically for plant & seedling nurseries selling crops like Tomato, Mirchi, Brinjal, Cabbage, and other varieties to farmers.

---

## 🚀 Application Features

- **Dashboard**: Real-time KPIs (Today's Sales, Total Seedlings Grown, Remaining Available Stock, Customer Credit Outstanding), Recharts sales trend & payment breakdown charts, low stock alerts, ready-to-sell batches, recent bills.
- **Stock Management**: Plant categories (Tomato 🍅, Mirchi 🌶️, Brinjal 🍆, Cabbage 🥬), variety rates, batch tracking (Sowing Date, Ready Date, Initial Qty, Sold Qty, Wastage, Available Qty = `Initial - Sold - Wastage`), seedling wastage recording.
- **POS Billing Module**: Customer search / quick farmer registration, multi-item line builder with live stock checks stopping over-selling, payment modes (Cash, UPI, Credit), instant printable receipts, WhatsApp link sharing.
- **Farmer Directory**: Farmer profiles, total purchases, paid amounts, pending credit balance tracking, payment recording, statement history.
- **Expenses**: Operational expenses log (Seeds, Fertilizer, Labour, Transportation, Electricity, Water, Packaging, Maintenance).
- **Reports & Profit/Loss**: Daily sales, Monthly trend, Variety sales, Stock audit, Expense breakdown, Net Profit / Loss statement (`Total Sales - Total Expenses`), Customer Outstanding Report with 1-click WhatsApp payment reminders.
- **Excel Exports**: Multi-sheet `ANNADATA_Customers.xlsx` (Customers, Transactions, Payments), Stock report export, Expenses export via SheetJS.
- **Authentication**: JWT authentication, protected routes, secure logout with confirmation dialog.

---

## 🛠️ Technology Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide React + Recharts + Axios + SheetJS (`xlsx`)
- **Backend**: Node.js + Express + Mongoose + JWT + bcryptjs + SheetJS (`xlsx`)
- **Database**: MongoDB / MongoDB Atlas (with MongoMemoryServer zero-config local fallback)

---

## 📁 Repository Structure

```text
annadata-nursery/
├── backend/
│   ├── config/ (db.js)
│   ├── controllers/ (Auth, Dashboard, Batch, Bill, Customer, Expense, Export, Payment, Plant, Report, Settings, Variety)
│   ├── middleware/ (authMiddleware.js)
│   ├── models/ (User, Plant, Variety, Batch, Wastage, Customer, Bill, Payment, Expense, Settings)
│   ├── routes/ (api.js)
│   ├── utils/ (excelExporter.js, seedData.js)
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/ (assets: nursery_hero_bg.jpg, nursery_login_split.jpg)
│   ├── src/
│   │   ├── components/ (billing, common, customers)
│   │   ├── context/ (AuthContext, ToastContext)
│   │   ├── pages/ (Landing, Login, Dashboard, StockManagement, Billing, BillsHistory, Customers, Expenses, Reports, DataExport, Settings)
│   │   ├── services/ (api.js with dynamic VITE_API_URL)
│   │   └── utils/ (formatters.js, whatsapp.js)
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── package.json
```

---

## 💻 Local Setup Instructions

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/annadata-nursery.git
cd annadata-nursery

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables (.env)

#### Backend (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/annadata_nursery
JWT_SECRET=ANNADATA_SECRET_KEY_2026
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run Application
```bash
# Start Backend (Port 5000)
cd backend
npm run dev

# Start Frontend (Port 5173)
cd frontend
npm run dev
```

Navigate to `http://localhost:5173`.
Demo Admin Credentials: `admin@annadata.com` / `admin123`.

---

## 🌐 Production Deployment Guide (Vercel + Render + MongoDB Atlas)

```text
GitHub
   │
   ├─► Frontend ──► Vercel (React Router SPA with vercel.json)
   ├─► Backend  ──► Render (Node.js Express Web Service)
   └─► Database ──► MongoDB Atlas Cluster
```

### Step 1: MongoDB Atlas Database Setup
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster and database user.
3. Network Access: Add IP Address `0.0.0.0/0` (allow access from anywhere for cloud deployment).
4. Copy your Connection String (`mongodb+srv://<username>:<password>@cluster.mongodb.net/annadata_nursery`).

### Step 2: Push Repository to GitHub
```bash
cd annadata-nursery
git remote add origin https://github.com/your-username/annadata-nursery.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy Backend to Render
1. Sign into [Render](https://render.com).
2. Click **New +** -> **Web Service** -> Connect your GitHub repo (`annadata-nursery`).
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Environment Variables:
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://...` (your Atlas string)
   - `JWT_SECRET` = `your_secure_jwt_secret`
   - `CLIENT_URL` = `https://your-frontend.vercel.app` (update after Step 4)
5. Deploy and copy your backend URL (`https://annadata-nursery-api.onrender.com`).

### Step 4: Deploy Frontend to Vercel
1. Sign into [Vercel](https://vercel.com).
2. Click **Add New** -> **Project** -> Import `annadata-nursery`.
3. Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - `VITE_API_URL` = `https://annadata-nursery-api.onrender.com` (your Render URL from Step 3)
5. Click **Deploy**.

### Step 5: Update Backend CORS URL
1. Go back to Render -> Backend Web Service -> Environment Variables.
2. Update `CLIENT_URL` with your live Vercel domain (`https://your-frontend.vercel.app`).
3. Save & trigger backend redeploy.
