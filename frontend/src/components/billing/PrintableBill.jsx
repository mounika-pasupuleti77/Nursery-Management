import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PrintableBill = ({ bill, settings = {} }) => {
  if (!bill) return null;

  return (
    <div id="printable-bill-area" className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-800 font-sans max-w-2xl mx-auto shadow-xs">
      {/* Header */}
      <div className="text-center border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-black text-emerald-800 tracking-wide uppercase">
          {settings.nurseryName || 'ANNADATA NURSERY'}
        </h1>
        <p className="text-xs font-semibold text-emerald-600 mt-0.5">
          {settings.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}
        </p>
        <div className="text-xs text-slate-500 mt-2 space-y-0.5">
          {settings.address && <p>{settings.address}{settings.village ? `, ${settings.village}` : ''}</p>}
          {settings.mobileNumber && <p>Contact: +91 {settings.mobileNumber} {settings.ownerName ? `(${settings.ownerName})` : ''}</p>}
          {settings.gstNumber && <p className="font-mono text-[11px]">GSTIN: {settings.gstNumber}</p>}
        </div>
      </div>

      {/* Bill Meta & Customer Info */}
      <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <p className="text-slate-400 font-medium uppercase text-[10px]">Bill Details</p>
          <p className="font-bold text-slate-800 text-sm">{bill.billNumber}</p>
          <p className="text-slate-600">Date: {formatDate(bill.createdAt)}</p>
          <p className="text-slate-600">Payment Mode: <span className="font-semibold">{bill.paymentMode}</span></p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-medium uppercase text-[10px]">Farmer Details</p>
          <p className="font-bold text-slate-800 text-sm">{bill.customerId?.farmerName || 'Customer'}</p>
          <p className="text-slate-600">Mobile: {bill.customerId?.mobile || '-'}</p>
          {bill.customerId?.village && <p className="text-slate-600">Village: {bill.customerId.village}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-xs text-left mb-4 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-300 bg-slate-100/70 text-slate-700">
            <th className="py-2 px-2">#</th>
            <th className="py-2 px-2">Plant & Variety</th>
            <th className="py-2 px-2">Batch</th>
            <th className="py-2 px-2 text-right">Qty</th>
            <th className="py-2 px-2 text-right">Rate</th>
            <th className="py-2 px-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-2 font-medium text-slate-500">{index + 1}</td>
              <td className="py-2 px-2 font-medium">
                <div>{item.plantName}</div>
                <div className="text-[11px] text-slate-500">{item.varietyName}</div>
              </td>
              <td className="py-2 px-2 font-mono text-[11px] text-slate-600">{item.batchNumber}</td>
              <td className="py-2 px-2 text-right font-semibold">{item.quantity.toLocaleString('en-IN')}</td>
              <td className="py-2 px-2 text-right">{formatCurrency(item.rate, settings.currencySymbol)}</td>
              <td className="py-2 px-2 text-right font-semibold">{formatCurrency(item.amount, settings.currencySymbol)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Summary */}
      <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 max-w-xs ml-auto">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal:</span>
          <span>{formatCurrency(bill.subtotal, settings.currencySymbol)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount:</span>
            <span>- {formatCurrency(bill.discount, settings.currencySymbol)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
          <span>Grand Total:</span>
          <span>{formatCurrency(bill.grandTotal, settings.currencySymbol)}</span>
        </div>
        <div className="flex justify-between text-slate-700 font-medium">
          <span>Paid Amount:</span>
          <span className="text-emerald-700">{formatCurrency(bill.paidAmount, settings.currencySymbol)}</span>
        </div>
        {bill.pendingAmount > 0 && (
          <div className="flex justify-between text-rose-700 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-100">
            <span>Pending Balance:</span>
            <span>{formatCurrency(bill.pendingAmount, settings.currencySymbol)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-6 pt-4 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700">Thank you for choosing {settings.nurseryName || 'ANNADATA NURSERY'}!</p>
        <p className="text-[11px] text-slate-400 mt-0.5">We wish you a healthy crop & abundant harvest 🌾</p>
      </div>
    </div>
  );
};

export default PrintableBill;
