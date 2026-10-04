const Bill = require('../models/Bill');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');

const generateBillNumber = async () => {
  const settings = (await Settings.findOne()) || { billPrefix: 'AN' };
  const count = await Bill.countDocuments();
  const prefix = settings.billPrefix || 'AN';
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
};

const getBills = async (req, res) => {
  try {
    const { search, paymentStatus, paymentMode, startDate, endDate } = req.query;
    let filter = {};

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMode) filter.paymentMode = paymentMode;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let query = Bill.find(filter)
      .populate('customerId', 'farmerName mobile village customerId')
      .sort({ createdAt: -1 });

    let bills = await query;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      bills = bills.filter(b => 
        b.billNumber.match(searchRegex) ||
        (b.customerId && b.customerId.farmerName.match(searchRegex)) ||
        (b.customerId && b.customerId.mobile.match(searchRegex))
      );
    }

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id).populate('customerId');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const { customerId, items, subtotal, discount, grandTotal, paidAmount, paymentMode, notes } = req.body;

    if (!customerId || !items || !items.length || grandTotal === undefined || paidAmount === undefined || !paymentMode) {
      return res.status(400).json({ message: 'Missing required bill information' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };

    // Step 1: Validate stock for all items BEFORE performing any updates
    const batchUpdates = [];
    for (const item of items) {
      const batch = await Batch.findById(item.batchId);
      if (!batch) {
        return res.status(404).json({ message: `Batch ${item.batchNumber || item.batchId} not found` });
      }

      batch.calculateStatus(settings.lowStockThreshold);

      if (item.quantity > batch.availableQuantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.varietyName} (Batch ${batch.batchNumber}). Requested: ${item.quantity}, Available: ${batch.availableQuantity}`
        });
      }

      batchUpdates.push({ batch, quantity: item.quantity });
    }

    // Step 2: Calculate financial fields safely
    const numSubtotal = Number(subtotal);
    const numDiscount = Number(discount || 0);
    const numGrandTotal = Number(grandTotal);
    const numPaid = Number(paidAmount);
    const numPending = Math.max(0, numGrandTotal - numPaid);

    let paymentStatus = 'Paid';
    if (numPaid === 0) {
      paymentStatus = 'Pending';
    } else if (numPaid < numGrandTotal) {
      paymentStatus = 'Partially Paid';
    }

    const billNumber = await generateBillNumber();

    // Step 3: Deduct stock from batches
    for (const update of batchUpdates) {
      const { batch, quantity } = update;
      batch.soldQuantity += quantity;
      batch.calculateStatus(settings.lowStockThreshold);
      await batch.save();
    }

    // Step 4: Create Bill record
    const bill = await Bill.create({
      billNumber,
      customerId,
      items,
      subtotal: numSubtotal,
      discount: numDiscount,
      grandTotal: numGrandTotal,
      paidAmount: numPaid,
      pendingAmount: numPending,
      paymentMode,
      paymentStatus,
      notes: notes || ''
    });

    // Step 5: Update Customer financial summary
    customer.totalPurchase += numGrandTotal;
    customer.totalPaid += numPaid;
    customer.pendingAmount += numPending;
    await customer.save();

    // Step 6: Record initial Payment transaction if paidAmount > 0
    if (numPaid > 0) {
      await Payment.create({
        customerId,
        billId: bill._id,
        amount: numPaid,
        paymentMode,
        date: new Date(),
        notes: `Bill payment for ${billNumber}`
      });
    }

    const populatedBill = await Bill.findById(bill._id).populate('customerId');
    res.status(201).json(populatedBill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.paymentStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Bill is already cancelled' });
    }

    const settings = (await Settings.findOne()) || { lowStockThreshold: 1000 };

    // Restore stock to batches
    for (const item of bill.items) {
      const batch = await Batch.findById(item.batchId);
      if (batch) {
        batch.soldQuantity = Math.max(0, batch.soldQuantity - item.quantity);
        batch.calculateStatus(settings.lowStockThreshold);
        await batch.save();
      }
    }

    // Update Customer outstanding balance
    const customer = await Customer.findById(bill.customerId);
    if (customer) {
      customer.totalPurchase = Math.max(0, customer.totalPurchase - bill.grandTotal);
      customer.totalPaid = Math.max(0, customer.totalPaid - bill.paidAmount);
      customer.pendingAmount = Math.max(0, customer.pendingAmount - bill.pendingAmount);
      await customer.save();
    }

    bill.paymentStatus = 'Cancelled';
    await bill.save();

    res.json({ message: `Bill ${bill.billNumber} cancelled successfully`, bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBills, getBillById, createBill, cancelBill };
