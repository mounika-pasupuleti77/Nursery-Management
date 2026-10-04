const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Batch = require('../models/Batch');
const Expense = require('../models/Expense');
const {
  generateCustomerExcelBuffer,
  generateStockExcelBuffer,
  generateExpenseExcelBuffer
} = require('../utils/excelExporter');

const exportCustomersExcel = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const bills = await Bill.find().populate('customerId').sort({ createdAt: -1 });
    const payments = await Payment.find().populate('customerId billId').sort({ date: -1 });

    const buffer = generateCustomerExcelBuffer(customers, bills, payments);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ANNADATA_Customers.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportStockExcel = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('plantId', 'name')
      .populate('varietyId', 'name')
      .sort({ createdAt: -1 });

    const buffer = generateStockExcelBuffer(batches);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ANNADATA_Stock_Report.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportExpensesExcel = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    const buffer = generateExpenseExcelBuffer(expenses);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ANNADATA_Expenses.xlsx"');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportCustomersExcel,
  exportStockExcel,
  exportExpensesExcel
};
