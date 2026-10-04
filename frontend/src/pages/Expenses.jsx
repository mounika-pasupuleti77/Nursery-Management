import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Wallet, Plus, Search, FileSpreadsheet, Trash2, Edit2 } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Form State
  const [category, setCategory] = useState('Seeds');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { settings } = useAuth();
  const { addToast } = useToast();

  const categories = [
    'Seeds',
    'Fertilizer',
    'Labour',
    'Transportation',
    'Electricity',
    'Water',
    'Packaging',
    'Maintenance',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      addToast('Failed to load expenses list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setCategory('Seeds');
    setDescription('');
    setAmount('');
    setPaymentMethod('Cash');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setCategory(exp.category);
    setDescription(exp.description);
    setAmount(exp.amount.toString());
    setPaymentMethod(exp.paymentMethod || 'Cash');
    setDate(new Date(exp.date).toISOString().split('T')[0]);
    setNotes(exp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      if (editingExpense) {
        await API.put(`/expenses/${editingExpense._id}`, {
          category,
          description,
          amount: Number(amount),
          paymentMethod,
          date,
          notes
        });
        addToast('Expense record updated!', 'success');
      } else {
        await API.post('/expenses', {
          category,
          description,
          amount: Number(amount),
          paymentMethod,
          date,
          notes
        });
        addToast('Expense recorded successfully!', 'success');
      }

      setIsAddModalOpen(false);
      fetchExpenses();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save expense', 'error');
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await API.delete(`/expenses/${expenseToDelete._id}`);
      addToast('Expense deleted successfully', 'success');
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      addToast('Failed to delete expense', 'error');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/export/expenses', '_blank');
  };

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    if (categoryFilter && e.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchDesc = e.description.toLowerCase().includes(q);
      const matchId = e.expenseId.toLowerCase().includes(q);
      if (!matchDesc && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-purple-600" />
            <span>Nursery Expense Tracker ({expenses.length})</span>
          </h1>
          <p className="text-xs text-slate-500">
            Track operational costs (Seeds, Labor, Electricity, Fertilizers) for Profit & Loss calculations
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Total Expenses Banner */}
      <div className="bg-purple-900 text-white p-5 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs text-purple-200 uppercase font-semibold">Total Operational Expenses</span>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">
            {formatCurrency(totalExpenseAmount, settings?.currencySymbol)}
          </h2>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold">
          {expenses.length} Expense Entry(ies)
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description or Expense ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <LoadingSpinner label="Loading nursery expenses..." />
      ) : filteredExpenses.length === 0 ? (
        <EmptyState title="No expense records found" description="Record seeds, labor, or electricity bills to monitor net profit." actionLabel="Record Expense" onAction={handleOpenAdd} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Expense ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{exp.expenseId}</td>
                    <td className="p-3 text-slate-600">{formatDate(exp.date)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-900 font-semibold border border-purple-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">{exp.description}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(exp.amount, settings?.currencySymbol)}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{exp.paymentMethod}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpenseToDelete(exp)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXPENSE */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingExpense ? `Edit Expense - ${editingExpense.expenseId}` : 'Record New Expense'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expense Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Purchased raw seeds (100g)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount ({settings?.currencySymbol || '₹'}) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs">Save Expense</button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense Record"
        message={`Are you sure you want to delete expense '${expenseToDelete?.description}' (${formatCurrency(expenseToDelete?.amount || 0)})?`}
        confirmText="Yes, Delete"
        isDanger={true}
      />
    </div>
  );
};

export default Expenses;
