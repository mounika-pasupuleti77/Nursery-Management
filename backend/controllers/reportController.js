const Bill = require('../models/Bill');
const Batch = require('../models/Batch');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const Settings = require('../models/Settings');

// 1. Daily Sales Report
const getDailySales = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: { $ne: 'Cancelled' }
    });

    let totalBills = bills.length;
    let totalSales = 0;
    let totalQuantity = 0;
    let cashSales = 0;
    let upiSales = 0;
    let creditSales = 0;

    bills.forEach(bill => {
      totalSales += bill.grandTotal;
      if (bill.paymentMode === 'Cash') cashSales += bill.grandTotal;
      if (bill.paymentMode === 'UPI') upiSales += bill.grandTotal;
      if (bill.paymentMode === 'Credit') creditSales += bill.grandTotal;

      bill.items.forEach(item => {
        totalQuantity += item.quantity;
      });
    });

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      totalBills,
      totalQuantity,
      totalSales,
      paymentBreakdown: {
        cash: cashSales,
        upi: upiSales,
        credit: creditSales
      },
      bills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Monthly Sales Report
const getMonthlySales = async (req, res) => {
  try {
    const bills = await Bill.find({ paymentStatus: { $ne: 'Cancelled' } });
    
    const monthlyMap = {};
    bills.forEach(bill => {
      const dateObj = new Date(bill.createdAt);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthKey,
          totalSales: 0,
          totalBills: 0,
          totalQuantity: 0,
          cash: 0,
          upi: 0,
          credit: 0
        };
      }

      monthlyMap[monthKey].totalSales += bill.grandTotal;
      monthlyMap[monthKey].totalBills += 1;
      if (bill.paymentMode === 'Cash') monthlyMap[monthKey].cash += bill.grandTotal;
      if (bill.paymentMode === 'UPI') monthlyMap[monthKey].upi += bill.grandTotal;
      if (bill.paymentMode === 'Credit') monthlyMap[monthKey].credit += bill.grandTotal;

      bill.items.forEach(item => {
        monthlyMap[monthKey].totalQuantity += item.quantity;
      });
    });

    const report = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Variety-wise Sales Report
const getVarietySales = async (req, res) => {
  try {
    const bills = await Bill.find({ paymentStatus: { $ne: 'Cancelled' } });
    const varietyMap = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const key = `${item.plantName} - ${item.varietyName}`;
        if (!varietyMap[key]) {
          varietyMap[key] = {
            plantName: item.plantName,
            varietyName: item.varietyName,
            quantitySold: 0,
            totalSales: 0
          };
        }
        varietyMap[key].quantitySold += item.quantity;
        varietyMap[key].totalSales += item.amount;
      });
    });

    const report = Object.values(varietyMap).sort((a, b) => b.totalSales - a.totalSales);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Stock Report
const getStockReport = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('plantId', 'name')
      .populate('varietyId', 'name')
      .sort({ createdAt: -1 });

    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Expense Report by Category
const getExpenseReport = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const categoryMap = {};

    expenses.forEach(exp => {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = {
          category: exp.category,
          count: 0,
          totalAmount: 0
        };
      }
      categoryMap[exp.category].count += 1;
      categoryMap[exp.category].totalAmount += exp.amount;
    });

    const report = Object.values(categoryMap).sort((a, b) => b.totalAmount - a.totalAmount);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Profit & Loss Report
const getProfitLoss = async (req, res) => {
  try {
    const { filter = 'this_month', startDate, endDate } = req.query;

    let start = new Date();
    let end = new Date();

    if (filter === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'this_week') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (filter === 'this_month') {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (filter === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default all time
      start = new Date(2000, 0, 1);
    }

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: { $ne: 'Cancelled' }
    });

    const expenses = await Expense.find({
      date: { $gte: start, $lte: end }
    });

    const totalSales = bills.reduce((acc, b) => acc + b.grandTotal, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfitLoss = totalSales - totalExpenses;

    res.json({
      filter,
      startDate: start,
      endDate: end,
      totalSales,
      totalExpenses,
      netProfitLoss,
      isProfit: netProfitLoss >= 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Customer Outstanding Report
const getOutstandingReport = async (req, res) => {
  try {
    const customers = await Customer.find({ pendingAmount: { $gt: 0 } }).sort({ pendingAmount: -1 });
    const settings = (await Settings.findOne()) || {};

    const formattedCustomers = customers.map(c => {
      const reminderMsg = `Dear ${c.farmerName} Ji,\nGreetings from ${settings.nurseryName || 'ANNADATA NURSERY'}.\n\nThis is a friendly reminder that your outstanding balance is ₹${c.pendingAmount}.\nKindly clear the payment at your earliest convenience.\n\nFor details/UPI payment, contact: ${settings.mobileNumber || ''}.\nThank you!`;
      
      return {
        ...c.toObject(),
        whatsappReminderMsg: encodeURIComponent(reminderMsg)
      };
    });

    res.json(formattedCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailySales,
  getMonthlySales,
  getVarietySales,
  getStockReport,
  getExpenseReport,
  getProfitLoss,
  getOutstandingReport
};
