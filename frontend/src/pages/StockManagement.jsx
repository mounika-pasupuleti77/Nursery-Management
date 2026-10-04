import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Sprout, Plus, Search, Filter, AlertOctagon, Trash2, Edit, Layers } from 'lucide-react';

const StockManagement = () => {
  const [activeTab, setActiveTab] = useState('batches'); // 'batches', 'plants'
  const [batches, setBatches] = useState([]);
  const [plants, setPlants] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isAddVarietyOpen, setIsAddVarietyOpen] = useState(false);
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isWastageOpen, setIsWastageOpen] = useState(false);

  // Form states
  const [plantName, setPlantName] = useState('');
  const [plantDesc, setPlantDesc] = useState('');

  const [varPlantId, setVarPlantId] = useState('');
  const [varName, setVarName] = useState('');
  const [varDefaultRate, setVarDefaultRate] = useState('');
  const [varDesc, setVarDesc] = useState('');

  const [batchNum, setBatchNum] = useState('');
  const [batchPlantId, setBatchPlantId] = useState('');
  const [batchVarietyId, setBatchVarietyId] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [readyDate, setReadyDate] = useState('');
  const [initialQty, setInitialQty] = useState('');
  const [batchRate, setBatchRate] = useState('');
  const [batchNotes, setBatchNotes] = useState('');

  const [wastageBatch, setWastageBatch] = useState(null);
  const [wastageQty, setWastageQty] = useState('');
  const [wastageReason, setWastageReason] = useState('Damaged seedlings');
  const [wastageNotes, setWastageNotes] = useState('');

  const { settings } = useAuth();
  const { addToast } = useToast();

  const plantEmojiMap = {
    tomato: '🍅',
    mirchi: '🌶️',
    brinjal: '🍆',
    cabbage: '🥬',
    capsicum: '🫑'
  };

  const getPlantEmoji = (name) => {
    if (!name) return '🌱';
    const lower = name.toLowerCase();
    for (const key in plantEmojiMap) {
      if (lower.includes(key)) return plantEmojiMap[key];
    }
    return '🌱';
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bRes, pRes, vRes] = await Promise.all([
        API.get('/batches'),
        API.get('/plants'),
        API.get('/varieties')
      ]);
      setBatches(bRes.data);
      setPlants(pRes.data);
      setVarieties(vRes.data);
    } catch (err) {
      addToast('Failed to load stock inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await API.get('/batches');
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    if (!plantName.trim()) return;
    try {
      const res = await API.post('/plants', { name: plantName, description: plantDesc });
      addToast(`Plant category '${res.data.name}' added!`, 'success');
      setPlantName('');
      setPlantDesc('');
      setIsAddPlantOpen(false);
      fetchInitialData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add plant', 'error');
    }
  };

  const handleAddVariety = async (e) => {
    e.preventDefault();
    if (!varPlantId || !varName || varDefaultRate === '') return;
    try {
      const res = await API.post('/varieties', {
        plantId: varPlantId,
        name: varName,
        defaultRate: Number(varDefaultRate),
        description: varDesc
      });
      addToast(`Variety '${res.data.name}' added!`, 'success');
      setVarPlantId('');
      setVarName('');
      setVarDefaultRate('');
      setVarDesc('');
      setIsAddVarietyOpen(false);
      fetchInitialData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add variety', 'error');
    }
  };

  const handleBatchVarietyChange = (vId) => {
    setBatchVarietyId(vId);
    const foundVar = varieties.find((v) => v._id === vId);
    if (foundVar) {
      setBatchRate(foundVar.defaultRate);
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!batchNum || !batchPlantId || !batchVarietyId || !sowingDate || !readyDate || !initialQty || !batchRate) {
      addToast('Please fill in all required batch fields', 'error');
      return;
    }

    if (new Date(sowingDate) > new Date(readyDate)) {
      addToast('Sowing date cannot be after Ready date', 'error');
      return;
    }

    try {
      const res = await API.post('/batches', {
        batchNumber: batchNum,
        plantId: batchPlantId,
        varietyId: batchVarietyId,
        sowingDate,
        readyDate,
        initialQuantity: Number(initialQty),
        rate: Number(batchRate),
        notes: batchNotes
      });
      addToast(`Batch '${res.data.batchNumber}' created successfully!`, 'success');
      setBatchNum('');
      setBatchPlantId('');
      setBatchVarietyId('');
      setSowingDate('');
      setReadyDate('');
      setInitialQty('');
      setBatchRate('');
      setBatchNotes('');
      setIsAddBatchOpen(false);
      fetchBatches();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create batch', 'error');
    }
  };

  const handleRecordWastage = async (e) => {
    e.preventDefault();
    if (!wastageBatch || !wastageQty || Number(wastageQty) <= 0) {
      addToast('Please enter a valid wastage quantity', 'error');
      return;
    }

    try {
      const res = await API.post(`/batches/${wastageBatch._id}/wastage`, {
        quantity: Number(wastageQty),
        reason: wastageReason,
        notes: wastageNotes
      });
      addToast(`Recorded wastage of ${wastageQty} seedlings for batch ${wastageBatch.batchNumber}`, 'success');
      setWastageBatch(null);
      setWastageQty('');
      setWastageNotes('');
      setIsWastageOpen(false);
      fetchBatches();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record wastage', 'error');
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (selectedPlant && b.plantId?._id !== selectedPlant) return false;
    if (selectedVariety && b.varietyId?._id !== selectedVariety) return false;
    if (selectedStatus && b.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNum = b.batchNumber.toLowerCase().includes(q);
      const matchPlant = b.plantId?.name.toLowerCase().includes(q);
      const matchVar = b.varietyId?.name.toLowerCase().includes(q);
      if (!matchNum && !matchPlant && !matchVar) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-forest-700" />
            <span>Stock & Seedling Management</span>
          </h1>
          <p className="text-xs text-slate-500">Manage Tomato 🍅, Mirchi 🌶️, Brinjal 🍆 seedling batches and wastage</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsAddPlantOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-forest-700" />
            <span>New Plant Category</span>
          </button>
          <button
            onClick={() => setIsAddVarietyOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-forest-700" />
            <span>New Variety</span>
          </button>
          <button
            onClick={() => setIsAddBatchOpen(true)}
            className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('batches')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stock Batches ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plants')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'plants'
              ? 'border-forest-700 text-forest-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Plants & Varieties</span>
        </button>
      </div>

      {/* TAB 1: BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search batch #, plant or variety..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedPlant}
              onChange={(e) => {
                setSelectedPlant(e.target.value);
                setSelectedVariety('');
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="">All Crop Categories</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>
                  {getPlantEmoji(p.name)} {p.name}
                </option>
              ))}
            </select>

            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="">All Varieties</option>
              {varieties
                .filter((v) => !selectedPlant || v.plantId?._id === selectedPlant)
                .map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Ready">Ready</option>
              <option value="Not Ready">Not Ready</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Batches Table */}
          {loading ? (
            <LoadingSpinner label="Loading stock batches..." />
          ) : filteredBatches.length === 0 ? (
            <EmptyState
              title="No batches match filters"
              description="Try clearing search filters or create a new seedling batch."
              actionLabel="Create New Batch"
              onAction={() => setIsAddBatchOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Batch #</th>
                      <th className="p-3">Plant & Variety</th>
                      <th className="p-3">Sowing Date</th>
                      <th className="p-3">Ready Date</th>
                      <th className="p-3 text-right">Initial</th>
                      <th className="p-3 text-right">Sold</th>
                      <th className="p-3 text-right">Wastage</th>
                      <th className="p-3 text-right">Available</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Wastage Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBatches.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{getPlantEmoji(b.plantId?.name)}</span>
                            <span>{b.plantId?.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{b.varietyId?.name}</div>
                        </td>
                        <td className="p-3 text-slate-600">{formatDate(b.sowingDate)}</td>
                        <td className="p-3 text-slate-600">{formatDate(b.readyDate)}</td>
                        <td className="p-3 text-right font-medium">{b.initialQuantity.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-emerald-700 font-semibold">{b.soldQuantity.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right text-rose-600 font-semibold">{b.wastage.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-black text-slate-900 bg-emerald-50/60">
                          {b.availableQuantity.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(b.rate, settings?.currencySymbol)}</td>
                        <td className="p-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setWastageBatch(b);
                              setIsWastageOpen(true);
                            }}
                            title="Record Seedling Wastage"
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            + Wastage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLANTS & VARIETIES */}
      {activeTab === 'plants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plants Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Plant Categories ({plants.length})</h3>
              <button
                onClick={() => setIsAddPlantOpen(true)}
                className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plant</span>
              </button>
            </div>
            <div className="space-y-2">
              {plants.map((p) => (
                <div key={p._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPlantEmoji(p.name)}</span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{p.name}</span>
                      <span className="text-slate-500">{p.description || 'No description'}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Varieties Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Varieties & Rates ({varieties.length})</h3>
              <button
                onClick={() => setIsAddVarietyOpen(true)}
                className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variety</span>
              </button>
            </div>
            <div className="space-y-2">
              {varieties.map((v) => (
                <div key={v._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{v.name}</span>
                    <span className="text-slate-500 text-[11px]">{v.plantId?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-forest-800 block">
                      {formatCurrency(v.defaultRate, settings?.currencySymbol)} / seedling
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PLANT */}
      <Modal isOpen={isAddPlantOpen} onClose={() => setIsAddPlantOpen(false)} title="Add Plant Category" maxWidth="max-w-md">
        <form onSubmit={handleAddPlant} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plant Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Tomato, Mirchi, Brinjal, Cabbage"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Optional details..."
              value={plantDesc}
              onChange={(e) => setPlantDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAddPlantOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-xs">Save Plant</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD VARIETY */}
      <Modal isOpen={isAddVarietyOpen} onClose={() => setIsAddVarietyOpen(false)} title="Add Plant Variety" maxWidth="max-w-md">
        <form onSubmit={handleAddVariety} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plant Category <span className="text-rose-500">*</span></label>
            <select
              required
              value={varPlantId}
              onChange={(e) => setVarPlantId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>{getPlantEmoji(p.name)} {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Variety Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. Hybrid 101"
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Default Rate ({settings?.currencySymbol || '₹'}) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              step="0.05"
              min="0"
              required
              placeholder="1.20"
              value={varDefaultRate}
              onChange={(e) => setVarDefaultRate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Disease resistant"
              value={varDesc}
              onChange={(e) => setVarDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAddVarietyOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-xs">Save Variety</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE BATCH */}
      <Modal isOpen={isAddBatchOpen} onClose={() => setIsAddBatchOpen(false)} title="Create New Stock Batch" maxWidth="max-w-xl">
        <form onSubmit={handleAddBatch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Batch Number <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. TOM-2026-003"
                value={batchNum}
                onChange={(e) => setBatchNum(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Plant Category <span className="text-rose-500">*</span></label>
              <select
                required
                value={batchPlantId}
                onChange={(e) => {
                  setBatchPlantId(e.target.value);
                  setBatchVarietyId('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
              >
                <option value="">Select Plant</option>
                {plants.map((p) => (
                  <option key={p._id} value={p._id}>{getPlantEmoji(p.name)} {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Variety Name <span className="text-rose-500">*</span></label>
              <select
                required
                value={batchVarietyId}
                onChange={(e) => handleBatchVarietyChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-forest-500 focus:outline-none"
              >
                <option value="">Select Variety</option>
                {varieties
                  .filter((v) => !batchPlantId || v.plantId?._id === batchPlantId)
                  .map((v) => (
                    <option key={v._id} value={v._id}>{v.name} (Default: ₹{v.defaultRate})</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Rate per Seedling ({settings?.currencySymbol || '₹'}) <span className="text-rose-500">*</span></label>
              <input
                type="number"
                step="0.05"
                min="0"
                required
                placeholder="1.20"
                value={batchRate}
                onChange={(e) => setBatchRate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Sowing Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                required
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ready Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                required
                value={readyDate}
                onChange={(e) => setReadyDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Initial Qty <span className="text-rose-500">*</span></label>
              <input
                type="number"
                min="1"
                required
                placeholder="10000"
                value={initialQty}
                onChange={(e) => setInitialQty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Batch Notes</label>
            <input
              type="text"
              placeholder="e.g. Polyhouse 2, Tray Block B"
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsAddBatchOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-xs">Create Batch</button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD WASTAGE */}
      <Modal isOpen={isWastageOpen} onClose={() => setIsWastageOpen(false)} title={`Record Wastage - ${wastageBatch?.batchNumber}`} maxWidth="max-w-md">
        <form onSubmit={handleRecordWastage} className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex justify-between items-center">
            <span>Available Stock in Batch:</span>
            <span className="font-bold text-sm text-slate-900">{wastageBatch?.availableQuantity.toLocaleString('en-IN')} seedlings</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Wastage Quantity <span className="text-rose-500">*</span></label>
            <input
              type="number"
              min="1"
              max={wastageBatch?.availableQuantity || 999999}
              required
              placeholder="e.g. 150"
              value={wastageQty}
              onChange={(e) => setWastageQty(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Reason for Damage / Wastage</label>
            <select
              value={wastageReason}
              onChange={(e) => setWastageReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="Damaged seedlings">Damaged seedlings</option>
              <option value="Damping off fungal disease">Damping off fungal disease</option>
              <option value="Heavy rain / Overwatering">Heavy rain / Overwatering</option>
              <option value="Pest infestation">Pest infestation</option>
              <option value="Poor germination rate">Poor germination rate</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional details..."
              value={wastageNotes}
              onChange={(e) => setWastageNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsWastageOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs">Record Wastage</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockManagement;
