import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PrintableBill from '../components/billing/PrintableBill';
import WhatsAppShareModal from '../components/billing/WhatsAppShareModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Receipt, Search, Printer, Share2, Ban } from 'lucide-react';

const BillsHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Modals
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [billToCancel, setBillToCancel] = useState(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const { settings } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bills');
      setBills(res.data);
    } catch (err) {
      addToast('Failed to load bill history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBill = async () => {
    if (!billToCancel) return;
    try {
      setCancelLoading(true);
      await API.put(`/bills/${billToCancel._id}/cancel`);
      addToast(`Bill ${billToCancel.billNumber} cancelled and stock restored`, 'success');
      setBillToCancel(null);
      setIsCancelConfirmOpen(false);
      fetchBills();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel bill', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBills = bills.filter((b) => {
    if (statusFilter && b.paymentStatus !== statusFilter) return false;
    if (modeFilter && b.paymentMode !== modeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = b.billNumber.toLowerCase().includes(q);
      const matchCust = b.customerId?.farmerName.toLowerCase().includes(q);
      const matchMob = b.customerId?.mobile.includes(q);
      if (!matchNum && !matchCust && !matchMob) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Sales Bills History ({bills.length})</span>
          </h1>
          <p className="text-xs text-slate-500">View financial sales receipts, reprint bills, or share via WhatsApp</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Bill #, Customer Name, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">All Payment Modes</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Credit">Credit</option>
        </select>
      </div>

      {/* Bills Table */}
      {loading ? (
        <LoadingSpinner label="Loading sales bills history..." />
      ) : filteredBills.length === 0 ? (
        <EmptyState title="No sales bills found" description="Create a new bill from the POS Billing screen." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Bill No</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">Grand Total</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Pending</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{b.billNumber}</td>
                    <td className="p-3 text-slate-600">{formatDate(b.createdAt)}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{b.customerId?.farmerName || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{b.customerId?.mobile}</div>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(b.subtotal, settings?.currencySymbol)}</td>
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
                          onClick={() => {
                            setSelectedBill(b);
                            setIsPrintOpen(true);
                          }}
                          title="Print Receipt"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setIsWhatsAppOpen(true);
                          }}
                          title="Share on WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {b.paymentStatus !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setBillToCancel(b);
                              setIsCancelConfirmOpen(true);
                            }}
                            title="Cancel Bill & Restore Stock"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {isPrintOpen && selectedBill && (
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
                  <span>Print Now</span>
                </button>
                <button
                  onClick={() => setIsPrintOpen(false)}
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
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        bill={selectedBill}
        settings={settings}
      />

      {/* CANCEL CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelBill}
        title="Cancel Bill & Restore Stock"
        message={`Are you sure you want to cancel Bill ${billToCancel?.billNumber}? This will automatically restore the seedling stock to batches and adjust farmer balances.`}
        confirmText="Yes, Cancel Bill"
        isDanger={true}
        loading={cancelLoading}
      />
    </div>
  );
};

export default BillsHistory;
