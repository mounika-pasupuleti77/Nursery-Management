const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');

const recordPayment = async (req, res) => {
  try {
    const { customerId, billId, amount, paymentMode, notes } = req.body;

    const payAmount = Number(amount);
    if (!customerId || !payAmount || payAmount <= 0) {
      return res.status(400).json({ message: 'Customer ID and a valid positive amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Update Customer balances
    customer.totalPaid += payAmount;
    customer.pendingAmount = Math.max(0, customer.pendingAmount - payAmount);
    await customer.save();

    // If payment is linked to a specific bill
    let bill = null;
    if (billId) {
      bill = await Bill.findById(billId);
      if (bill) {
        bill.paidAmount += payAmount;
        bill.pendingAmount = Math.max(0, bill.pendingAmount - payAmount);
        if (bill.pendingAmount === 0) {
          bill.paymentStatus = 'Paid';
        } else {
          bill.paymentStatus = 'Partially Paid';
        }
        await bill.save();
      }
    }

    const payment = await Payment.create({
      customerId,
      billId: billId || null,
      amount: payAmount,
      paymentMode: paymentMode || 'Cash',
      date: new Date(),
      notes: notes || ''
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customerId', 'farmerName mobile customerId')
      .populate('billId', 'billNumber grandTotal pendingAmount');

    res.status(201).json({
      message: `Payment of ₹${payAmount} recorded successfully`,
      payment: populatedPayment,
      customer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerPayments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const payments = await Payment.find({ customerId })
      .populate('billId', 'billNumber')
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { recordPayment, getCustomerPayments };
