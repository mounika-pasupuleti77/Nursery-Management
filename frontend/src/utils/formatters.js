export const formatCurrency = (amount, symbol = '₹') => {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Available':
    case 'Paid':
    case 'Ready':
    case 'Active':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Low Stock':
    case 'Partially Paid':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Not Ready':
    case 'Pending':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Out of Stock':
    case 'Completed':
    case 'Cancelled':
    case 'Inactive':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};
