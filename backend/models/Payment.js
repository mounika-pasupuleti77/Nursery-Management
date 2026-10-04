const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', default: null },
    amount: { type: Number, required: true, min: 1 },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'], default: 'Cash' },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
