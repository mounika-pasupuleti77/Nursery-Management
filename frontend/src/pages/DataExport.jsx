import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Download, Users, Receipt, Sprout, Wallet, Database } from 'lucide-react';

const DataExport = () => {
  const { settings } = useAuth();

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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>Excel Export & Data Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Export nursery database records to `.xlsx` spreadsheets for offline records, accounting, and backups
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-100">
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export to Excel</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataExport;
