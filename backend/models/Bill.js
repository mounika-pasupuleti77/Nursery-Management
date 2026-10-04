const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
  plantName: { type: String, required: true },
  varietyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variety', required: true },
  varietyName: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  batchNumber: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  amount: { type: Number, required: true, min: 0 }
});

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [billItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    pendingAmount: { type: Number, required: true, min: 0 },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Credit'], required: true },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Pending', 'Cancelled'],
      required: true
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
