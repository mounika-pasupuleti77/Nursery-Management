const mongoose = require('mongoose');

const varietySchema = new mongoose.Schema(
  {
    plantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant', required: true },
    name: { type: String, required: true },
    defaultRate: { type: Number, required: true, default: 1.0 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Variety', varietySchema);
