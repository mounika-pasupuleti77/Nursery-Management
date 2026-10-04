import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import RecordPaymentModal from './RecordPaymentModal';
import API from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User, Phone, MapPin, CreditCard, DollarSign, Calendar, Plus } from 'lucide-react';

const CustomerProfileModal = ({ isOpen, onClose, customerId, settings, onUpdate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerProfile();
    }
  }, [isOpen, customerId]);

  const fetchCustomerProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/customers/${customerId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const customer = data?.customer;
  const bills = data?.bills || [];
  const payments = data?.payments || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Farmer Profile" maxWidth="max-w-4xl">
      {loading || !customer ? (
        <div className="p-8 text-center text-slate-500">Loading farmer details...</div>
      ) : (
        <div className="space-y-6">
          {/* Top Banner / Summary Header */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                {customer.farmerName ? customer.farmerName.charAt(0).toUpperCase() : 'F'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{customer.farmerName}</h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                    {customer.customerId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {customer.mobile}
                  </span>
                  {customer.village && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {customer.village}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Total Purchases</div>
              <div className="text-xl font-bold text-slate-800 mt-1">
                {formatCurrency(customer.totalPurchase, settings?.currencySymbol)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Total Paid</div>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {formatCurrency(customer.totalPaid, settings?.currencySymbol)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Pending Outstanding</div>
              <div className="text-xl font-bold text-rose-600 mt-1">
                {formatCurrency(customer.pendingAmount, settings?.currencySymbol)}
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Purchase History ({bills.length})</span>
            </h4>
            {bills.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No bills found for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Bill No</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Pending</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {bills.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 font-mono">{b.billNumber}</td>
                        <td className="p-3 text-slate-600">{formatDate(b.createdAt)}</td>
                        <td className="p-3 text-slate-700">
                          {b.items.map((i) => `${i.plantName} (${i.quantity})`).join(', ')}
                        </td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(b.grandTotal, settings?.currencySymbol)}</td>
                        <td className="p-3 text-right text-emerald-700">{formatCurrency(b.paidAmount, settings?.currencySymbol)}</td>
                        <td className="p-3 text-right text-rose-600 font-semibold">{formatCurrency(b.pendingAmount, settings?.currencySymbol)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.paymentStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Transactions History */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Payment History ({payments.length})</span>
            </h4>
            {payments.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">
                No payment receipts recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Linked Bill</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3 text-right">Amount Paid</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td className="p-3 text-slate-600">{formatDate(p.date || p.createdAt)}</td>
                        <td className="p-3 font-mono text-slate-700">
                          {p.billId?.billNumber || 'Direct Payment'}
                        </td>
                        <td className="p-3 font-medium text-slate-700">{p.paymentMode}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {formatCurrency(p.amount, settings?.currencySymbol)}
                        </td>
                        <td className="p-3 text-slate-500 italic">{p.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <RecordPaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            customer={customer}
            bills={bills}
            settings={settings}
            onPaymentSuccess={() => {
              fetchCustomerProfile();
              if (onUpdate) onUpdate();
            }}
          />
        </div>
      )}
    </Modal>
  );
};

export default CustomerProfileModal;
