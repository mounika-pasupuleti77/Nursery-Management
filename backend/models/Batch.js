const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, unique: true },
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    varietyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variety', required: true },
    sowingDate: { type: Date, required: true },
    readyDate: { type: Date, required: true },
    initialQuantity: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, default: 0, min: 0 },
    wastage: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Not Ready', 'Ready', 'Available', 'Low Stock', 'Out of Stock', 'Completed'],
      default: 'Available'
    },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

// Helper method to compute and assign calculated status
batchSchema.methods.calculateStatus = function (lowStockThreshold = 1000) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rDate = new Date(this.readyDate);
  rDate.setHours(0, 0, 0, 0);

  this.availableQuantity = Math.max(0, this.initialQuantity - this.soldQuantity - this.wastage);

  if (this.availableQuantity === 0) {
    if (this.soldQuantity + this.wastage >= this.initialQuantity && this.initialQuantity > 0) {
      this.status = 'Completed';
    } else {
      this.status = 'Out of Stock';
    }
  } else if (today < rDate) {
    this.status = 'Not Ready';
  } else if (this.availableQuantity <= lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'Available';
  }
};

module.exports = mongoose.model('Batch', batchSchema);
