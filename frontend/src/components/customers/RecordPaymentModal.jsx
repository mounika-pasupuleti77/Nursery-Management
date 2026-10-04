import React, { useState } from 'react';
import Modal from '../common/Modal';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

const RecordPaymentModal = ({ isOpen, onClose, customer, bills = [], onPaymentSuccess, settings }) => {
  const { addToast } = useToast();
  const [amount, setAmount] = useState('');
  const [billId, setBillId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!customer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      addToast('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/payments', {
        customerId: customer._id,
        billId: billId || null,
        amount: numAmount,
        paymentMode,
        notes
      });

      addToast(res.data.message || `Payment of ₹${numAmount} recorded successfully!`, 'success');
      setAmount('');
      setBillId('');
      setNotes('');
      onPaymentSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment - ${customer.farmerName}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex justify-between items-center">
          <span>Current Pending Balance:</span>
          <span className="font-bold text-sm text-rose-700">
            {formatCurrency(customer.pendingAmount, settings?.currencySymbol)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Payment Amount ({settings?.currencySymbol || '₹'}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            max={customer.pendingAmount || 999999}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Apply to Bill (Optional)</label>
          <select
            value={billId}
            onChange={(e) => setBillId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="">General Account Payment</option>
            {bills
              .filter((b) => b.pendingAmount > 0)
              .map((b) => (
                <option key={b._id} value={b._id}>
                  {b.billNumber} (Pending: {formatCurrency(b.pendingAmount, settings?.currencySymbol)})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Transaction Reference</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. UPI Ref #987654"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
