import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FileSpreadsheet, Download, Users, Receipt, Sprout, Wallet, Database, CheckCircle2, Server, Layers } from 'lucide-react';

const DataExport = () => {
  const { settings } = useAuth();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const fetchDbStatus = async () => {
    try {
      setLoading(true);
      const res = await API.get('/database/inspect');
      setDbData(res.data);
    } catch (err) {
      console.error('Failed to fetch database status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (endpoint) => {
    window.open(endpoint, '_blank');
  };

  const exportCards = [
    {
      title: 'Customer Excel Workbook',
      filename: 'ANNADATA_Customers.xlsx',
      description: 'Generates Excel workbook containing 3 synchronized sheets: 1. Customers List, 2. Sales Transactions, 3. Payment Receipts.',
      icon: Users,
      color: 'emerald',
      endpoint: '/api/export/customers'
    },
    {
      title: 'Stock & Seedlings Excel Report',
      filename: 'ANNADATA_Stock_Report.xlsx',
      description: 'Export complete batch-wise stock data with Sowing Date, Ready Date, Initial Qty, Sold Qty, Wastage, and Available Stock.',
      icon: Sprout,
      color: 'blue',
      endpoint: '/api/export/stock'
    },
    {
      title: 'Nursery Expenses Excel Log',
      filename: 'ANNADATA_Expenses.xlsx',
      description: 'Export operational expenses log categorized by Seeds, Fertilizer, Labour, Electricity, Water, and Transportation.',
      icon: Wallet,
      color: 'purple',
      endpoint: '/api/export/expenses'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-forest-700" />
            <span>Database Status & Excel Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Inspect live MongoDB database collections and export records to `.xlsx` spreadsheets
          </p>
        </div>
      </div>

      {/* LIVE DATABASE INSPECTION STATUS BANNER */}
      {loading ? (
        <LoadingSpinner label="Connecting to MongoDB Database..." />
      ) : dbData ? (
        <div className="bg-forest-950 text-white p-6 rounded-3xl shadow-xl border border-forest-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-700 text-emerald-300 flex items-center justify-center font-bold shadow-lg border border-emerald-400/30">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="text-lg font-bold text-white">MongoDB Database Connection: Active</h2>
                </div>
                <p className="text-xs text-emerald-300 font-mono mt-0.5">
                  Database: <span className="font-bold text-white">{dbData.dbInfo?.dbName}</span> ({dbData.dbInfo?.connectionUri})
                </p>
              </div>
            </div>

            <div className="bg-forest-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs font-semibold text-emerald-200">
              Host: {dbData.dbInfo?.host}
            </div>
          </div>

          {/* Collection Counts Grid */}
          <div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Live MongoDB Database Collection Counts</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
                <span className="text-slate-400 block text-[11px]">Customers Collection</span>
                <span className="text-lg font-extrabold text-white">{dbData.counts?.customers} Documents</span>
              </div>
              <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
                <span className="text-slate-400 block text-[11px]">Bills Collection</span>
                <span className="text-lg font-extrabold text-white">{dbData.counts?.bills} Documents</span>
              </div>
              <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
                <span className="text-slate-400 block text-[11px]">Stock Batches</span>
                <span className="text-lg font-extrabold text-white">{dbData.counts?.batches} Documents</span>
              </div>
              <div className="p-3 bg-forest-900/60 rounded-xl border border-forest-800">
                <span className="text-slate-400 block text-[11px]">Expenses Log</span>
                <span className="text-lg font-extrabold text-white">{dbData.counts?.expenses} Documents</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* EXCEL EXPORT CARDS */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-forest-700" />
          <span>Export Database Tables to Excel (.xlsx)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exportCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center mb-4 border border-forest-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">{card.description}</p>
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 inline-block mb-6">
                    {card.filename}
                  </span>
                </div>

                <button
                  onClick={() => handleDownload(card.endpoint)}
                  className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export to Excel</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataExport;
