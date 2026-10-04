const mongoose = require('mongoose');
const User = require('../models/User');
const Plant = require('../models/Plant');
const Variety = require('../models/Variety');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Settings = require('../models/Settings');

const getDatabaseInspect = async (req, res) => {
  try {
    const [
      userCount,
      plantCount,
      varietyCount,
      batchCount,
      customerCount,
      billCount,
      paymentCount,
      expenseCount
    ] = await Promise.all([
      User.countDocuments(),
      Plant.countDocuments(),
      Variety.countDocuments(),
      Batch.countDocuments(),
      Customer.countDocuments(),
      Bill.countDocuments(),
      Payment.countDocuments(),
      Expense.countDocuments()
    ]);

    const connectionStateMap = {
      0: 'Disconnected',
      1: 'Connected & Active',
      2: 'Connecting',
      3: 'Disconnecting'
    };

    const host = mongoose.connection.host || 'Memory Database Host';
    const dbName = mongoose.connection.name || 'annadata_nursery';

    // Sample data previews
    const [recentCustomers, recentBatches, recentBills] = await Promise.all([
      Customer.find().sort({ createdAt: -1 }).limit(5),
      Batch.find().populate('plantId varietyId').sort({ createdAt: -1 }).limit(5),
      Bill.find().populate('customerId', 'farmerName mobile').sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      dbInfo: {
        status: connectionStateMap[mongoose.connection.readyState] || 'Connected',
        host,
        dbName,
        connectionUri: process.env.MONGO_URI ? 'MongoDB Atlas / Local MongoDB' : 'In-Memory Database Server (Local Active)'
      },
      counts: {
        users: userCount,
        plants: plantCount,
        varieties: varietyCount,
        batches: batchCount,
        customers: customerCount,
        bills: billCount,
        payments: paymentCount,
        expenses: expenseCount
      },
      previews: {
        customers: recentCustomers,
        batches: recentBatches,
        bills: recentBills
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDatabaseInspect };
