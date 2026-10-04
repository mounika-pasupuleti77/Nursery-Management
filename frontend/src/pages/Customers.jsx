import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import CustomerProfileModal from '../components/customers/CustomerProfileModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Users, UserPlus, Search, FileSpreadsheet, Eye, Edit2, Phone, MapPin } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [villageFilter, setVillageFilter] = useState('');

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form State
  const [farmerName, setFarmerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');

  const { settings } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      addToast('Failed to load farmer customers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFarmerName('');
    setMobile('');
    setVillage('');
    setAddress('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFarmerName(c.farmerName);
    setMobile(c.mobile);
    setVillage(c.village || '');
    setAddress(c.address || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmerName || !mobile) return;

    try {
      if (editingCustomer) {
        await API.put(`/customers/${editingCustomer._id}`, {
          farmerName,
          mobile,
          village,
          address
        });
        addToast(`Farmer ${farmerName} updated successfully!`, 'success');
      } else {
        await API.post('/customers', {
          farmerName,
          mobile,
          village,
          address
        });
        addToast(`Farmer ${farmerName} registered successfully!`, 'success');
      }

      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/export/customers', '_blank');
  };

  const filteredCustomers = customers.filter((c) => {
    if (villageFilter && (!c.village || !c.village.toLowerCase().includes(villageFilter.toLowerCase()))) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchName = c.farmerName.toLowerCase().includes(q);
      const matchMob = c.mobile.includes(q);
      const matchId = c.customerId.toLowerCase().includes(q);
      const matchVil = c.village && c.village.toLowerCase().includes(q);
      if (!matchName && !matchMob && !matchId && !matchVil) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Farmer Customer Directory ({customers.length})</span>
          </h1>
          <p className="text-xs text-slate-500">Manage farmer profiles, outstanding credit balances, and transaction history</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Farmer</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Farmer Name, Mobile, Village, or Customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <input
          type="text"
          placeholder="Filter by Village Name..."
          value={villageFilter}
          onChange={(e) => setVillageFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Customers Directory Table */}
      {loading ? (
        <LoadingSpinner label="Loading customer directory..." />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState title="No farmers found" description="Register new farmers to start billing and tracking payments." actionLabel="Add Farmer" onAction={handleOpenAdd} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Village</th>
                  <th className="p-3 text-right">Total Purchases</th>
                  <th className="p-3 text-right">Total Paid</th>
                  <th className="p-3 text-right">Pending Balance</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{c.customerId}</td>
                    <td className="p-3 font-bold text-slate-900">{c.farmerName}</td>
                    <td className="p-3 text-slate-600 font-mono">+91 {c.mobile}</td>
                    <td className="p-3 text-slate-600">{c.village || '-'}</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(c.totalPurchase, settings?.currencySymbol)}</td>
                    <td className="p-3 text-right text-emerald-700 font-semibold">{formatCurrency(c.totalPaid, settings?.currencySymbol)}</td>
                    <td className="p-3 text-right font-bold text-rose-600 bg-rose-50/30">
                      {formatCurrency(c.pendingAmount, settings?.currencySymbol)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCustomerId(c._id);
                            setIsProfileOpen(true);
                          }}
                          title="View Profile & Statement"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Farmer"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 border border-slate-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
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

      {/* MODAL: ADD / EDIT CUSTOMER */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? `Edit Farmer - ${editingCustomer.farmerName}` : 'Add New Farmer Customer'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Farmer Full Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number <span className="text-rose-500">*</span></label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Village Name</label>
            <input
              type="text"
              placeholder="e.g. Kisanpur"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Address / Landmark</label>
            <textarea
              rows="2"
              placeholder="Optional address details..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs">
              {editingCustomer ? 'Update Farmer' : 'Save Farmer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CUSTOMER PROFILE & STATEMENT DRAWER MODAL */}
      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        customerId={selectedCustomerId}
        settings={settings}
        onUpdate={fetchCustomers}
      />
    </div>
  );
};

export default Customers;
