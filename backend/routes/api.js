const express = require('express');
const router = express.Router();

const { loginUser, getMe } = require('../controllers/authController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { getPlants, createPlant, updatePlant, deletePlant } = require('../controllers/plantController');
const { getVarieties, createVariety, updateVariety, deleteVariety } = require('../controllers/varietyController');
const { getBatches, createBatch, updateBatch, deleteBatch, recordWastage } = require('../controllers/batchController');
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { getBills, getBillById, createBill, cancelBill } = require('../controllers/billController');
const { recordPayment, getCustomerPayments } = require('../controllers/paymentController');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const {
  getDailySales,
  getMonthlySales,
  getVarietySales,
  getStockReport,
  getExpenseReport,
  getProfitLoss,
  getOutstandingReport
} = require('../controllers/reportController');
const {
  exportCustomersExcel,
  exportStockExcel,
  exportExpensesExcel
} = require('../controllers/exportController');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { getDatabaseInspect } = require('../controllers/databaseController');

const { protect } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/login', loginUser);
router.get('/auth/me', protect, getMe);

// Settings Routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Dashboard Summary
router.get('/dashboard/summary', getDashboardSummary);

// Live Database Inspection Route
router.get('/database/inspect', getDatabaseInspect);

// Plant Routes
router.get('/plants', getPlants);
router.post('/plants', createPlant);
router.put('/plants/:id', updatePlant);
router.delete('/plants/:id', deletePlant);

// Variety Routes
router.get('/varieties', getVarieties);
router.post('/varieties', createVariety);
router.put('/varieties/:id', updateVariety);
router.delete('/varieties/:id', deleteVariety);

// Batch Routes
router.get('/batches', getBatches);
router.post('/batches', createBatch);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);
router.post('/batches/:id/wastage', recordWastage);

// Customer Routes
router.get('/customers', getCustomers);
router.post('/customers', createCustomer);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Bill Routes
router.get('/bills', getBills);
router.post('/bills', createBill);
router.get('/bills/:id', getBillById);
router.put('/bills/:id/cancel', cancelBill);

// Payment Routes
router.post('/payments', recordPayment);
router.get('/payments/customer/:customerId', getCustomerPayments);

// Expense Routes
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Report Routes
router.get('/reports/daily-sales', getDailySales);
router.get('/reports/monthly-sales', getMonthlySales);
router.get('/reports/variety-sales', getVarietySales);
router.get('/reports/stock', getStockReport);
router.get('/reports/expenses', getExpenseReport);
router.get('/reports/profit-loss', getProfitLoss);
router.get('/reports/outstanding', getOutstandingReport);

// Excel Export Routes
router.get('/export/customers', exportCustomersExcel);
router.get('/export/stock', exportStockExcel);
router.get('/export/expenses', exportExpensesExcel);

module.exports = router;
