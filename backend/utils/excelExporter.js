const XLSX = require('xlsx');

// Export Customers with 3 sheets: Customers, Transactions, Payments
const generateCustomerExcelBuffer = (customers, bills, payments) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Customers
  const customerData = customers.map(c => ({
    'Customer ID': c.customerId,
    'Farmer Name': c.farmerName,
    'Mobile': c.mobile,
    'Village': c.village || '',
    'Address': c.address || '',
    'Total Purchase (₹)': c.totalPurchase || 0,
    'Total Paid (₹)': c.totalPaid || 0,
    'Pending Amount (₹)': c.pendingAmount || 0,
    'Created Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Customers');

  // Sheet 2: Transactions (flattened bill items)
  const transactionRows = [];
  bills.forEach(b => {
    const custName = b.customerId?.farmerName || 'Unknown';
    const custMobile = b.customerId?.mobile || '';
    const custId = b.customerId?.customerId || '';
    
    b.items.forEach(item => {
      transactionRows.push({
        'Date': new Date(b.createdAt).toLocaleDateString(),
        'Bill Number': b.billNumber,
        'Customer ID': custId,
        'Farmer Name': custName,
        'Mobile': custMobile,
        'Plant': item.plantName,
        'Variety': item.varietyName,
        'Batch Number': item.batchNumber,
        'Quantity': item.quantity,
        'Rate (₹)': item.rate,
        'Discount (₹)': item.discount,
        'Total (₹)': item.amount,
        'Payment Mode': b.paymentMode,
        'Paid Amount (₹)': b.paidAmount,
        'Pending Amount (₹)': b.pendingAmount
      });
    });
  });
  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // Sheet 3: Payments
  const paymentRows = payments.map(p => ({
    'Date': new Date(p.date || p.createdAt).toLocaleDateString(),
    'Customer ID': p.customerId?.customerId || '',
    'Farmer Name': p.customerId?.farmerName || '',
    'Bill Number': p.billId?.billNumber || 'Direct Payment',
    'Payment Amount (₹)': p.amount,
    'Payment Mode': p.paymentMode
  }));
  const wsPayments = XLSX.utils.json_to_sheet(paymentRows);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// Export Stock
const generateStockExcelBuffer = (batches) => {
  const wb = XLSX.utils.book_new();
  const rows = batches.map(b => ({
    'Batch Number': b.batchNumber,
    'Plant': b.plantId?.name || '',
    'Variety': b.varietyId?.name || '',
    'Sowing Date': new Date(b.sowingDate).toLocaleDateString(),
    'Ready Date': new Date(b.readyDate).toLocaleDateString(),
    'Initial Quantity': b.initialQuantity,
    'Sold Quantity': b.soldQuantity,
    'Wastage': b.wastage,
    'Available Quantity': b.availableQuantity,
    'Rate (₹)': b.rate,
    'Status': b.status,
    'Notes': b.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Report');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// Export Expenses
const generateExpenseExcelBuffer = (expenses) => {
  const wb = XLSX.utils.book_new();
  const rows = expenses.map(e => ({
    'Expense ID': e.expenseId,
    'Date': new Date(e.date).toLocaleDateString(),
    'Category': e.category,
    'Description': e.description,
    'Amount (₹)': e.amount,
    'Payment Method': e.paymentMethod,
    'Notes': e.notes || ''
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

module.exports = {
  generateCustomerExcelBuffer,
  generateStockExcelBuffer,
  generateExpenseExcelBuffer
};
