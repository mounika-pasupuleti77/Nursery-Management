const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: [
        'Seeds',
        'Fertilizer',
        'Labour',
        'Transportation',
        'Electricity',
        'Water',
        'Packaging',
        'Maintenance',
        'Other'
      ],
      required: true
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Credit'], default: 'Cash' },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
