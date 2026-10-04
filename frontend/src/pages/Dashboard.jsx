import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PrintableBill from '../components/billing/PrintableBill';
import WhatsAppShareModal from '../components/billing/WhatsAppShareModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  IndianRupee,
  Sprout,
  Package,
  AlertTriangle,
  Receipt,
  Plus,
  UserPlus,
  Wallet,
  BarChart3,
  CheckCircle2,
  Printer,
  Share2,
  TrendingUp,
  Leaf
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const { settings } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner label="Loading nursery dashboard analytics..." />;
  }

  const { kpis, paymentBreakdown, stockByPlant, lowStockBatches, readyBatches, recentBills, salesTrend } = data;

  const handlePrintBill = (bill) => {
    setSelectedBill(bill);
    setIsPrintModalOpen(true);
  };

  const handleShareWhatsApp = (bill) => {
    setSelectedBill(bill);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. DASHBOARD HERO SECTION WITH VISIBLE NURSERY BACKGROUND */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-forest-900/40">
        {/* Real Nursery Background Image - Crisp & Visible */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/assets/nursery_hero_bg.jpg')" }}
        />
        {/* Layered Forest Translucent Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-forest-950/90 via-forest-900/75 to-slate-950/85 backdrop-blur-[1px]" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800/80 border border-emerald-400/40 text-xs font-semibold text-emerald-200 shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>Nursery Management Portal</span>
            </div>

            <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white drop-shadow-md">
              {settings?.nurseryName || 'ANNADATA NURSERY'}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-emerald-300 tracking-wider uppercase drop-shadow-xs">
              {settings?.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 shadow-lg">
            <button
              onClick={() => navigate('/billing')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Bill (POS)</span>
            </button>
            <button
              onClick={() => navigate('/stock')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs transition-all"
            >
              <Sprout className="w-4 h-4 text-emerald-300" />
              <span>Add Stock</span>
            </button>
            <button
              onClick={() => navigate('/customers')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs transition-all"
            >
              <UserPlus className="w-4 h-4 text-sky-300" />
              <span>Add Customer</span>
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl text-xs transition-all"
            >
              <Wallet className="w-4 h-4 text-purple-300" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(kpis.todaySales, settings?.currencySymbol)}
          subtext={`${kpis.todayBillCount} bill(s) generated today`}
          trend="+12.5% vs yesterday"
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Total Stock Grown"
          value={kpis.totalStock.toLocaleString('en-IN')}
          subtext="Total seedlings grown across batches"
          trend="Optimal"
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Remaining Stock"
          value={kpis.remainingStock.toLocaleString('en-IN')}
          subtext="Available ready/sown seedlings"
          trend="In Stock"
          icon={Sprout}
          color="purple"
        />
        <StatCard
          title="Pending Outstanding"
          value={formatCurrency(kpis.pendingAmount, settings?.currencySymbol)}
          subtext="Total customer credit balance"
          trend="Needs Follow-up"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sales Overview (7-Day Revenue)</h3>
              <p className="text-xs text-slate-500">Daily sales revenue in {settings?.currencySymbol || '₹'}</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Revenue</span>
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val, settings?.currencySymbol), 'Sales']}
                  contentStyle={{ backgroundColor: '#0f5132', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="sales" fill="#15803d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Payment Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution by Cash, UPI & Credit</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val, settings?.currencySymbol)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. STOCK & ALERTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Category Available Stock */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Stock Overview by Crop</h3>
          <p className="text-xs text-slate-500 mb-4">Available seedlings count per crop type</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByPlant} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={75} />
                <Tooltip formatter={(val) => [`${val.toLocaleString('en-IN')} seedlings`, 'Available']} />
                <Bar dataKey="availableQuantity" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              {lowStockBatches.length}
            </span>
          </div>

          {lowStockBatches.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-6 rounded-xl text-center">
              All stock batches are healthy above threshold!
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lowStockBatches.map((b) => (
                <div key={b._id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{b.batchNumber}</p>
                    <p className="text-slate-500">{b.plantId?.name} - {b.varietyId?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 block">{b.availableQuantity.toLocaleString('en-IN')} left</span>
                    <StatusBadge status="Low Stock" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ready-to-Sell Batches */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready-to-Sell Batches</span>
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              {readyBatches.length}
            </span>
          </div>

          {readyBatches.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-6 rounded-xl text-center">
              No batches currently ready for immediate sale.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {readyBatches.map((b) => (
                <div key={b._id} className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{b.batchNumber}</p>
                    <p className="text-slate-500">{b.varietyId?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-800 block">{b.availableQuantity.toLocaleString('en-IN')} seedlings</span>
                    <span className="text-[10px] text-slate-400">Ready: {formatDate(b.readyDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. RECENT BILLS TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recent Bills</h3>
            <p className="text-xs text-slate-500">Latest 5 sales receipts generated</p>
          </div>
          <button
            onClick={() => navigate('/billing')}
            className="text-xs font-bold text-forest-700 hover:text-forest-800 underline"
          >
            View All Bills
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Bill No</th>
                <th className="p-3">Farmer Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Pending</th>
                <th className="p-3">Payment Mode</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBills.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800 font-mono">{b.billNumber}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">👨‍🌾 {b.customerId?.farmerName || 'Customer'}</div>
                    <div className="text-[10px] text-slate-400">{b.customerId?.mobile}</div>
                  </td>
                  <td className="p-3 text-slate-600">{formatDate(b.createdAt)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(b.grandTotal, settings?.currencySymbol)}</td>
                  <td className="p-3 text-right text-emerald-700 font-semibold">{formatCurrency(b.paidAmount, settings?.currencySymbol)}</td>
                  <td className="p-3 text-right text-rose-600 font-semibold">{formatCurrency(b.pendingAmount, settings?.currencySymbol)}</td>
                  <td className="p-3 font-medium text-slate-700">{b.paymentMode}</td>
                  <td className="p-3">
                    <StatusBadge status={b.paymentStatus} />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handlePrintBill(b)}
                        title="Print Bill"
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(b)}
                        title="Share on WhatsApp"
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT RECEIPT MODAL */}
      {isPrintModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-center mb-4 no-print border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Print Receipt - {selectedBill.billNumber}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <PrintableBill bill={selectedBill} settings={settings} />
          </div>
        </div>
      )}

      {/* WHATSAPP SHARE MODAL */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        bill={selectedBill}
        settings={settings}
      />
    </div>
  );
};

export default Dashboard;
