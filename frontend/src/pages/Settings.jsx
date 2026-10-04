import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, Save, Building2, Phone, MapPin, Hash, DollarSign } from 'lucide-react';

const Settings = () => {
  const { settings, fetchSettings } = useAuth();
  const { addToast } = useToast();

  const [nurseryName, setNurseryName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [billPrefix, setBillPrefix] = useState('AN');
  const [lowStockThreshold, setLowStockThreshold] = useState('1000');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setNurseryName(settings.nurseryName || 'ANNADATA NURSERY');
      setTagline(settings.tagline || 'Quality Seedlings • Better Yield • Farmer Trust');
      setOwnerName(settings.ownerName || 'Ramesh Patel');
      setMobileNumber(settings.mobileNumber || '9876543210');
      setAddress(settings.address || '');
      setVillage(settings.village || '');
      setGstNumber(settings.gstNumber || '');
      setBillPrefix(settings.billPrefix || 'AN');
      setLowStockThreshold(settings.lowStockThreshold?.toString() || '1000');
      setCurrencySymbol(settings.currencySymbol || '₹');
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.put('/settings', {
        nurseryName,
        tagline,
        ownerName,
        mobileNumber,
        address,
        village,
        gstNumber,
        billPrefix: billPrefix.toUpperCase(),
        lowStockThreshold: Number(lowStockThreshold),
        currencySymbol
      });

      addToast('Nursery settings updated successfully!', 'success');
      fetchSettings();
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
            <span>Nursery System Settings</span>
          </h1>
          <p className="text-xs text-slate-500">Configure business branding, receipt details, low stock threshold, and billing prefix</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        {/* Branding Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Nursery Branding & Tagline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nursery Business Name</label>
              <input
                type="text"
                required
                value={nurseryName}
                onChange={(e) => setNurseryName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Contact & Address (Used in Printed Receipts)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner / Manager Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nursery Full Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Town</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial & Stock Configurations */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-600" />
            <span>Billing & Inventory Configuration</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bill Number Prefix</label>
              <input
                type="text"
                required
                value={billPrefix}
                onChange={(e) => setBillPrefix(e.target.value.toUpperCase())}
                placeholder="AN"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                min="100"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 36ABCDE1234F1Z5"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
