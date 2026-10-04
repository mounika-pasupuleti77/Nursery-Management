import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Sprout, UserPlus, Wallet, Receipt, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, settings } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 17) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs px-3 sm:px-6 py-3 flex items-center justify-between">
      {/* Mobile / Tablet Left Menu Toggle & Brand Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-forest-800" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 min-w-0">
              <span className="truncate">{getGreeting()}</span>
              <span className="hidden md:inline-block text-slate-300">|</span>
              <span className="font-brand text-xs sm:text-sm font-semibold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200 truncate">
                🌱 {settings?.nurseryName || 'ANNADATA NURSERY'}
              </span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 hidden lg:block truncate">
            {settings?.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}
          </p>
        </div>
      </div>

      {/* Right Side: Quick Action Buttons & Mobile Profile Icon */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={() => navigate('/billing')}
          className="flex items-center gap-1.5 px-3 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>New Bill</span>
        </button>

        <button
          onClick={() => navigate('/stock')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
        >
          <Sprout className="w-3.5 h-3.5 text-forest-700" />
          <span>Add Stock</span>
        </button>

        <button
          onClick={() => navigate('/customers')}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-sky-600" />
          <span>Add Customer</span>
        </button>

        <button
          onClick={() => navigate('/expenses')}
          className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-purple-600" />
          <span>Add Expense</span>
        </button>

        <div className="lg:hidden ml-1 p-1.5 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-center text-forest-800 font-bold text-xs" title={user?.name || 'Admin'}>
          👨‍🌾
        </div>
      </div>
    </header>
  );
};

export default Navbar;
