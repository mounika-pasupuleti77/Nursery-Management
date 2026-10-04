import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Sprout,
  Wallet,
  AlertTriangle,
  FileSpreadsheet,
  Share2,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);

  // Report Data States
  const [dailySales, setDailySales] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [varietySales, setVarietySales] = useState([]);
  const [stockReport, setStockReport] = useState([]);
  const [expenseReport, setExpenseReport] = useState([]);
  const [profitLoss, setProfitLoss] = useState(null);
  const [outstandingList, setOutstandingList] = useState([]);

  // P&L Date Filter
  const [plFilter, setPlFilter] = useState('this_month');

  const { settings } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchAllReports();
  }, [plFilter]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [dsRes, msRes, vsRes, stRes, exRes, plRes, outRes] = await Promise.all([
        API.get('/reports/daily-sales'),
        API.get('/reports/monthly-sales'),
        API.get('/reports/variety-sales'),
        API.get('/reports/stock'),
        API.get('/reports/expenses'),
        API.get(`/reports/profit-loss?filter=${plFilter}`),
        API.get('/reports/outstanding')
      ]);

      setDailySales(dsRes.data);
      setMonthlySales(msRes.data);
      setVarietySales(vsRes.data);
      setStockReport(stRes.data);
      setExpenseReport(exRes.data);
      setProfitLoss(plRes.data);
      setOutstandingList(outRes.data);
    } catch (err) {
      addToast('Failed to load nursery reports data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsAppReminder = (c) => {
    const rawMobile = c.mobile ? c.mobile.replace(/\D/g, '') : '';
    const phone = rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${c.whatsappReminderMsg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-forest-700" />
            <span>Nursery Analytics & Reports</span>
          </h1>
          <p className="text-xs text-slate-500">Business performance reports, crop sales trends, stock audits, and profit/loss</p>
        </div>
      </div>

      {/* Navigation Tabs - Responsive Scroll/Wrap */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white px-2 sm:px-3 rounded-t-2xl gap-1 no-scrollbar">
        {[
          { id: 'sales', label: 'Sales Reports', icon: TrendingUp },
          { id: 'variety', label: 'Variety-wise Sales', icon: Sprout },
          { id: 'stock', label: 'Stock Audit Report', icon: FileSpreadsheet },
          { id: 'expenses', label: 'Expense Breakdown', icon: Wallet },
          { id: 'profit_loss', label: 'Profit & Loss Statement', icon: TrendingUp },
          { id: 'outstanding', label: 'Customer Outstanding', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 sm:px-3.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'border-forest-700 text-forest-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner label="Calculating business intelligence analytics..." />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* TAB 1: SALES REPORTS */}
          {activeTab === 'sales' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Bills</span>
                  <div className="text-lg sm:text-xl font-bold text-slate-800 mt-1">{dailySales?.totalBills} bills</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Seedlings Sold Today</span>
                  <div className="text-lg sm:text-xl font-bold text-forest-800 mt-1">{dailySales?.totalQuantity.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Revenue</span>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(dailySales?.totalSales, settings?.currencySymbol)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Mode Breakdown</span>
                  <div className="text-xs font-bold text-slate-700 mt-1">
                    Cash: ₹{dailySales?.paymentBreakdown.cash} | UPI: ₹{dailySales?.paymentBreakdown.upi} | Cr: ₹{dailySales?.paymentBreakdown.credit}
                  </div>
                </div>
              </div>

              {/* Monthly Sales Trend Chart */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-4">Monthly Sales Trend</h3>
                <div className="h-56 sm:h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySales}>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(val) => formatCurrency(val, settings?.currencySymbol)} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="cash" name="Cash Sales" fill="#16a34a" stackId="a" />
                      <Bar dataKey="upi" name="UPI Sales" fill="#0284c7" stackId="a" />
                      <Bar dataKey="credit" name="Credit Sales" fill="#eab308" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARIETY-WISE SALES */}
          {activeTab === 'variety' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-4">Variety-wise Crop Sales Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Plant Category</th>
                      <th className="p-3">Variety Name</th>
                      <th className="p-3 text-right">Quantity Sold</th>
                      <th className="p-3 text-right">Total Revenue Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {varietySales.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{v.plantName}</td>
                        <td className="p-3 font-semibold text-forest-800">{v.varietyName}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{v.quantitySold.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-black text-forest-800">{formatCurrency(v.totalSales, settings?.currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: STOCK AUDIT REPORT */}
          {activeTab === 'stock' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Batch-wise Seedling Stock Audit</h3>
                <button
                  onClick={() => window.open('/api/export/stock', '_blank')}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-forest-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-4 h-4 text-forest-700" />
                  <span>Export Stock Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Batch #</th>
                      <th className="p-3">Plant & Variety</th>
                      <th className="p-3">Sowing</th>
                      <th className="p-3">Ready</th>
                      <th className="p-3 text-right">Initial</th>
                      <th className="p-3 text-right">Sold</th>
                      <th className="p-3 text-right">Wastage</th>
                      <th className="p-3 text-right">Available</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockReport.map((b) => (
                      <tr key={b._id}>
                        <td className="p-3 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{b.plantId?.name}</span> - {b.varietyId?.name}
                        </td>
                        <td className="p-3 text-slate-600">{formatDate(b.sowingDate)}</td>
                        <td className="p-3 text-slate-600">{formatDate(b.readyDate)}</td>
                        <td className="p-3 text-right">{b.initialQuantity.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-emerald-700">{b.soldQuantity.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-rose-600 font-semibold">{b.wastage.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-bold text-slate-900 bg-emerald-50/50">{b.availableQuantity.toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSES BREAKDOWN */}
          {activeTab === 'expenses' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">Operational Expense Category Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Number of Expenses</th>
                      <th className="p-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenseReport.map((e, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-purple-900">{e.category}</td>
                        <td className="p-3 text-center font-semibold text-slate-700">{e.count}</td>
                        <td className="p-3 text-right font-black text-slate-900">{formatCurrency(e.totalAmount, settings?.currencySymbol)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROFIT & LOSS STATEMENT */}
          {activeTab === 'profit_loss' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Date Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">Profit & Loss Calculation</h3>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: 'this_week', label: 'This Week' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'all_time', label: 'All Time' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPlFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        plFilter === f.id
                          ? 'bg-forest-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {profitLoss && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
                    <div className="text-2xl sm:text-3xl font-black text-forest-800 mt-2">
                      {formatCurrency(profitLoss.totalSales, settings?.currencySymbol)}
                    </div>
                  </div>

                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
                      {formatCurrency(profitLoss.totalExpenses, settings?.currencySymbol)}
                    </div>
                  </div>

                  <div className={`p-5 sm:p-6 rounded-2xl border shadow-md text-white ${
                    profitLoss.isProfit ? 'bg-forest-900 border-forest-800' : 'bg-rose-900 border-rose-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Net Profit / Loss</span>
                      {profitLoss.isProfit ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <XCircle className="w-5 h-5 text-rose-300" />}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black mt-2">
                      {formatCurrency(Math.abs(profitLoss.netProfitLoss), settings?.currencySymbol)}
                    </div>
                    <p className="text-xs text-white/80 mt-1 font-medium">
                      {profitLoss.isProfit ? 'Net Profit Earned 🎉' : 'Net Operating Loss'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMER OUTSTANDING */}
          {activeTab === 'outstanding' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">Farmers with Pending Credit Balances</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Farmer Name</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Village</th>
                      <th className="p-3 text-right">Total Purchase</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Pending Amount</th>
                      <th className="p-3 text-center">WhatsApp Reminder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outstandingList.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">👨‍🌾 {c.farmerName}</td>
                        <td className="p-3 font-mono text-slate-600">+91 {c.mobile}</td>
                        <td className="p-3 text-slate-600">{c.village || '-'}</td>
                        <td className="p-3 text-right">{formatCurrency(c.totalPurchase, settings?.currencySymbol)}</td>
                        <td className="p-3 text-right text-emerald-700">{formatCurrency(c.totalPaid, settings?.currencySymbol)}</td>
                        <td className="p-3 text-right font-bold text-rose-600 bg-rose-50/40">
                          {formatCurrency(c.pendingAmount, settings?.currencySymbol)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleSendWhatsAppReminder(c)}
                            className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
