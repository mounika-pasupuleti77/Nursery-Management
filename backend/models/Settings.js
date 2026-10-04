const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    nurseryName: { type: String, default: 'ANNADATA NURSERY' },
    tagline: { type: String, default: 'Quality Seedlings • Better Yield • Farmer Trust' },
    ownerName: { type: String, default: 'Ramesh Patel' },
    mobileNumber: { type: String, default: '9876543210' },
    address: { type: String, default: 'Nursery Road, Near Agriculture Market' },
    village: { type: String, default: 'Kisanpur' },
    gstNumber: { type: String, default: '' },
    billPrefix: { type: String, default: 'AN' },
    lowStockThreshold: { type: Number, default: 1000 },
    currencySymbol: { type: String, default: '₹' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
