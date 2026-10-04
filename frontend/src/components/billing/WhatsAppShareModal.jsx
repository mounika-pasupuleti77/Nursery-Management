import React from 'react';
import Modal from '../common/Modal';
import { generateWhatsAppBillLink } from '../../utils/whatsapp';
import { MessageSquare, ExternalLink } from 'lucide-react';

const WhatsAppShareModal = ({ isOpen, onClose, bill, settings }) => {
  if (!bill) return null;

  const whatsappUrl = generateWhatsAppBillLink(bill, settings);

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const previewText = `🌱 *${settings?.nurseryName || 'ANNADATA NURSERY'}*\n_${settings?.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}_\n\n*Bill No:* ${bill.billNumber}\n*Customer:* ${bill.customerId?.farmerName || 'Customer'}\n*Grand Total:* ₹${bill.grandTotal}\n*Paid Amount:* ₹${bill.paidAmount}\n*Pending Balance:* ₹${bill.pendingAmount}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Bill on WhatsApp" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900">
            <p className="font-semibold mb-0.5">WhatsApp Deep Link</p>
            <p>Clicking below will open WhatsApp with a pre-formatted message for <strong>{bill.customerId?.farmerName}</strong> ({bill.customerId?.mobile || 'No Mobile'}).</p>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
          {previewText}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <span>Open WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WhatsAppShareModal;
