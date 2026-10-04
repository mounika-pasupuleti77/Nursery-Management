import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import PrintableBill from '../components/billing/PrintableBill';
import WhatsAppShareModal from '../components/billing/WhatsAppShareModal';
import { formatCurrency } from '../utils/formatters';
import { Receipt, UserPlus, Plus, Trash2, Printer, Share2, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bill Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Cart Items
  const [cart, setCart] = useState([]);

  // Current Item Selector State
  const [itemPlantId, setItemPlantId] = useState('');
  const [itemVarietyId, setItemVarietyId] = useState('');
  const [itemBatchId, setItemBatchId] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemRate, setItemRate] = useState('');
  const [itemDiscount, setItemDiscount] = useState('0');

  // Overall Financial State
  const [globalDiscount, setGlobalDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');

  // Modals
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // New Customer Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newVillage, setNewVillage] = useState('');

  const { settings } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, vRes, bRes] = await Promise.all([
        API.get('/customers'),
        API.get('/plants'),
        API.get('/varieties'),
        API.get('/batches')
      ]);
      setCustomers(cRes.data);
      setPlants(pRes.data);
      setVarieties(vRes.data);
      setBatches(bRes.data);
    } catch (err) {
      addToast('Failed to initialize POS billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  const availableBatches = batches.filter(
    (b) => b.varietyId?._id === itemVarietyId && b.availableQuantity > 0
  );
  const selectedBatch = batches.find((b) => b._id === itemBatchId);

  const handlePlantChange = (pId) => {
    setItemPlantId(pId);
    setItemVarietyId('');
    setItemBatchId('');
    setItemRate('');
  };

  const handleVarietyChange = (vId) => {
    setItemVarietyId(vId);
    setItemBatchId('');
    const matchingBatches = batches.filter((b) => b.varietyId?._id === vId && b.availableQuantity > 0);
    if (matchingBatches.length > 0) {
      const firstB = matchingBatches[0];
      setItemBatchId(firstB._id);
      setItemRate(firstB.rate);
    } else {
      const foundVar = varieties.find((v) => v._id === vId);
      if (foundVar) setItemRate(foundVar.defaultRate);
    }
  };

  const handleBatchChange = (bId) => {
    setItemBatchId(bId);
    const b = batches.find((x) => x._id === bId);
    if (b) setItemRate(b.rate);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    const qty = Number(itemQty);
    const rate = Number(itemRate);
    const disc = Number(itemDiscount || 0);

    if (!itemPlantId || !itemVarietyId || !itemBatchId || !qty || qty <= 0 || rate < 0) {
      addToast('Please select plant, variety, batch, and valid quantity', 'error');
      return;
    }

    if (!selectedBatch) {
      addToast('Selected batch is invalid', 'error');
      return;
    }

    const existingInCart = cart.find((i) => i.batchId === itemBatchId);
    const totalRequested = (existingInCart ? existingInCart.quantity : 0) + qty;

    if (totalRequested > selectedBatch.availableQuantity) {
      addToast(
        `Insufficient stock. Only ${selectedBatch.availableQuantity} seedlings are available in batch ${selectedBatch.batchNumber}`,
        'error'
      );
      return;
    }

    const plantObj = plants.find((p) => p._id === itemPlantId);
    const varObj = varieties.find((v) => v._id === itemVarietyId);

    const lineAmount = Math.max(0, qty * rate - disc);

    const newItem = {
      plantId: itemPlantId,
      plantName: plantObj?.name || '',
      varietyId: itemVarietyId,
      varietyName: varObj?.name || '',
      batchId: itemBatchId,
      batchNumber: selectedBatch.batchNumber,
      quantity: qty,
      rate,
      discount: disc,
      amount: lineAmount
    };

    setCart((prev) => [...prev, newItem]);
    addToast(`Added ${qty} ${varObj?.name} seedlings to bill`, 'success');

    setItemQty('');
    setItemDiscount('0');
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.amount, 0);
  const numGlobalDiscount = Number(globalDiscount || 0);
  const grandTotal = Math.max(0, subtotal - numGlobalDiscount);
  const numPaid = Number(paidAmount || 0);
  const pendingAmount = Math.max(0, grandTotal - numPaid);

  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    if (mode === 'Credit') {
      setPaidAmount('0');
    } else if (mode === 'Cash' || mode === 'UPI') {
      setPaidAmount(grandTotal.toString());
    }
  };

  const handleSubmitBill = async () => {
    if (!selectedCustomerId) {
      addToast('Please select a farmer customer for the bill', 'error');
      return;
    }

    if (cart.length === 0) {
      addToast('Please add at least one plant item to the bill', 'error');
      return;
    }

    if (numPaid > grandTotal) {
      addToast('Paid amount cannot exceed Grand Total', 'error');
      return;
    }

    try {
      const res = await API.post('/bills', {
        customerId: selectedCustomerId,
        items: cart,
        subtotal,
        discount: numGlobalDiscount,
        grandTotal,
        paidAmount: numPaid,
        paymentMode,
        notes
      });

      setCreatedBill(res.data);
      addToast(`Bill ${res.data.billNumber} created successfully!`, 'success');

      setCart([]);
      setSelectedCustomerId('');
      setGlobalDiscount('0');
      setPaidAmount('');
      setNotes('');

      setIsSuccessModalOpen(true);
      fetchBillingData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create bill', 'error');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newFarmerName || !newMobile) return;

    try {
      const res = await API.post('/customers', {
        farmerName: newFarmerName,
        mobile: newMobile,
        village: newVillage
      });

      addToast(`Farmer ${res.data.farmerName} registered successfully!`, 'success');
      setCustomers((prev) => [res.data, ...prev]);
      setSelectedCustomerId(res.data._id);

      setNewFarmerName('');
      setNewMobile('');
      setNewVillage('');
      setIsNewCustModalOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to register customer', 'error');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.farmerName.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 lg:pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-forest-700" />
            <span>Create Sales Bill (POS)</span>
          </h1>
          <p className="text-xs text-slate-500">Bill seedling sales to farmers with real-time stock deduction</p>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Item Selection */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Section 1: Customer Selection */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-forest-800 flex items-center justify-center text-xs font-bold">1</span>
              <span>Select Farmer Customer</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Choose Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {filteredCustomers.map((c) => (
                    <option key={c._id} value={c._id}>
                      👨‍🌾 {c.farmerName} ({c.mobile}) {c.village ? `- ${c.village}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Filter Name / Mobile</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Type name or mobile..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {selectedCustomer && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800">👨‍🌾 {selectedCustomer.farmerName}</span>
                  <span className="text-slate-500 block sm:inline sm:ml-2">Mobile: +91 {selectedCustomer.mobile}</span>
                  {selectedCustomer.village && <span className="text-slate-500 block sm:inline sm:ml-2">Village: {selectedCustomer.village}</span>}
                </div>
                <div>
                  <span className="text-slate-500">Current Pending: </span>
                  <span className="font-bold text-rose-600">
                    {formatCurrency(selectedCustomer.pendingAmount, settings?.currencySymbol)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Item Line Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 text-forest-800 flex items-center justify-center text-xs font-bold">2</span>
              <span>Add Seedling Items to Cart</span>
            </h3>

            <form onSubmit={handleAddToCart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Plant Category</label>
                  <select
                    value={itemPlantId}
                    onChange={(e) => handlePlantChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="">-- Select Plant --</option>
                    {plants.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Variety</label>
                  <select
                    value={itemVarietyId}
                    onChange={(e) => handleVarietyChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  >
                    <option value="">-- Select Variety --</option>
                    {varieties
                      .filter((v) => !itemPlantId || v.plantId?._id === itemPlantId)
                      .map((v) => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number</label>
                  <select
                    value={itemBatchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none font-mono"
                  >
                    <option value="">-- Select Batch --</option>
                    {availableBatches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batchNumber} (Avail: {b.availableQuantity.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBatch && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex justify-between items-center text-xs text-sky-900">
                  <span>Batch Stock Status:</span>
                  <span className="font-bold text-xs sm:text-sm text-forest-800">
                    {selectedBatch.availableQuantity.toLocaleString('en-IN')} seedlings available
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Quantity (Seedlings)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1000"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Rate per Seedling ({settings?.currencySymbol || '₹'})</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    placeholder="1.20"
                    value={itemRate}
                    onChange={(e) => setItemRate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Item Discount ({settings?.currencySymbol || '₹'})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={itemDiscount}
                    onChange={(e) => setItemDiscount(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item to Bill</span>
                </button>
              </div>
            </form>
          </div>

          {/* Cart Table */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3">Bill Items Cart ({cart.length})</h3>
            {cart.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-6 rounded-xl text-center">
                No seedling items added to cart yet. Select plant and batch above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Plant & Variety</th>
                      <th className="p-2.5">Batch</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Discount</th>
                      <th className="p-2.5 text-right">Total Amount</th>
                      <th className="p-2.5 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-800">{item.plantName}</span> - {item.varietyName}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{item.batchNumber}</td>
                        <td className="p-2.5 text-right font-bold">{item.quantity.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right">{formatCurrency(item.rate, settings?.currencySymbol)}</td>
                        <td className="p-2.5 text-right text-emerald-700">{formatCurrency(item.discount, settings?.currencySymbol)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.amount, settings?.currencySymbol)}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations & Bill Summary */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Bill Payment Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal, settings?.currencySymbol)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Global Discount ({settings?.currencySymbol || '₹'})</label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Grand Total:</span>
                <span className="text-base text-forest-800 font-extrabold">{formatCurrency(grandTotal, settings?.currencySymbol)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Credit'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handlePaymentModeChange(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMode === mode
                          ? 'bg-forest-700 text-white border-forest-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Paid Amount ({settings?.currencySymbol || '₹'})</label>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder={grandTotal.toString()}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-forest-800 focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center p-3 bg-rose-50/70 border border-rose-100 rounded-xl text-xs">
                <span className="font-semibold text-rose-900">Pending Balance:</span>
                <span className="font-bold text-sm text-rose-700">{formatCurrency(pendingAmount, settings?.currencySymbol)}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Bill Notes</label>
                <input
                  type="text"
                  placeholder="Optional billing note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitBill}
                disabled={cart.length === 0 || !selectedCustomerId}
                className="w-full py-3.5 bg-forest-700 hover:bg-forest-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Bill & Generate Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW CUSTOMER */}
      <Modal isOpen={isNewCustModalOpen} onClose={() => setIsNewCustModalOpen(false)} title="Quick Add New Farmer Customer" maxWidth="max-w-md">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Farmer Full Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patel"
              value={newFarmerName}
              onChange={(e) => setNewFarmerName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number <span className="text-rose-500">*</span></label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={newMobile}
              onChange={(e) => setNewMobile(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Village Name</label>
            <input
              type="text"
              placeholder="e.g. Kisanpur"
              value={newVillage}
              onChange={(e) => setNewVillage(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsNewCustModalOpen(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-xs">Save Farmer</button>
          </div>
        </form>
      </Modal>

      {/* POST-BILL SUCCESS MODAL */}
      {isSuccessModalOpen && createdBill && (
        <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Bill Created Successfully! 🎉" maxWidth="max-w-md">
          <div className="text-center space-y-4 p-2">
            <div className="w-16 h-16 bg-emerald-100 text-forest-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">Bill Number: {createdBill.billNumber}</p>
              <p className="text-xs text-slate-500">Customer: {createdBill.customerId?.farmerName}</p>
              <p className="text-lg font-black text-forest-800 mt-2">
                Total: {formatCurrency(createdBill.grandTotal, settings?.currencySymbol)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsWhatsAppModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PRINT RECEIPT MODAL */}
      {isPrintModalOpen && createdBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-4 sm:p-6 relative my-auto">
            <div className="flex justify-between items-center mb-4 no-print border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Print Receipt - {createdBill.billNumber}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Now</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <PrintableBill bill={createdBill} settings={settings} />
          </div>
        </div>
      )}

      {/* WHATSAPP SHARE MODAL */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        bill={createdBill}
        settings={settings}
      />
    </div>
  );
};

export default Billing;
