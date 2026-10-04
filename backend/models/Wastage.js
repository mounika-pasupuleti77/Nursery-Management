const mongoose = require('mongoose');

const wastageSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wastage', wastageSchema);
