const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true },
    farmerName: { type: String, required: true },
    mobile: { type: String, required: true },
    village: { type: String, default: '' },
    address: { type: String, default: '' },
    totalPurchase: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
