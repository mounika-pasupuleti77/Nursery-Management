import { formatCurrency, formatDate } from './formatters';

export const generateWhatsAppBillLink = (bill, settings = {}) => {
  const nurseryName = settings.nurseryName || 'ANNADATA NURSERY';
  const tagline = settings.tagline || 'Quality Seedlings • Better Yield • Farmer Trust';
  const mobile = bill.customerId?.mobile ? bill.customerId.mobile.replace(/\D/g, '') : '';
  const farmerName = bill.customerId?.farmerName || 'Farmer';

  let itemsList = '';
  bill.items.forEach((item) => {
    itemsList += `• ${item.plantName} - ${item.varietyName}\n  Qty: ${item.quantity.toLocaleString('en-IN')} | Rate: ${formatCurrency(item.rate, settings.currencySymbol || '₹')} | Amount: ${formatCurrency(item.amount, settings.currencySymbol || '₹')}\n`;
  });

  const message = `🌱 *${nurseryName}*\n_${tagline}_\n\n` +
    `*Bill No:* ${bill.billNumber}\n` +
    `*Date:* ${formatDate(bill.createdAt)}\n\n` +
    `*Customer:* ${farmerName}\n` +
    `*Mobile:* ${bill.customerId?.mobile || '-'}\n` +
    (bill.customerId?.village ? `*Village:* ${bill.customerId.village}\n` : '') +
    `\n*Items Purchased:*\n${itemsList}\n` +
    `*Subtotal:* ${formatCurrency(bill.subtotal, settings.currencySymbol || '₹')}\n` +
    (bill.discount > 0 ? `*Discount:* ${formatCurrency(bill.discount, settings.currencySymbol || '₹')}\n` : '') +
    `*Grand Total:* ${formatCurrency(bill.grandTotal, settings.currencySymbol || '₹')}\n` +
    `*Paid Amount:* ${formatCurrency(bill.paidAmount, settings.currencySymbol || '₹')}\n` +
    `*Pending Amount:* ${formatCurrency(bill.pendingAmount, settings.currencySymbol || '₹')}\n` +
    `*Payment Mode:* ${bill.paymentMode}\n\n` +
    `Thank you for choosing *${nurseryName}*!\n` +
    `For queries/support call: ${settings.mobileNumber || ''}`;

  const encodedText = encodeURIComponent(message);
  
  if (mobile && mobile.length >= 10) {
    const formattedPhone = mobile.length === 10 ? `91${mobile}` : mobile;
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedText}`;
};
