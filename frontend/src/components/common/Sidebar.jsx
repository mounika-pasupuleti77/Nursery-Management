import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog';
import {
  LayoutDashboard,
  Sprout,
  Receipt,
  Users,
  Wallet,
  BarChart3,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LogOut,
  UserCheck,
  X,
  Home
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, settings } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Stock Management', path: '/stock', icon: Sprout },
    { name: 'Billing (POS)', path: '/billing', icon: Receipt },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Expenses', path: '/expenses', icon: Wallet },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Excel / Data', path: '/data', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ];

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onClose) onClose();
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[270px] bg-forest-950 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-forest-900/60 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-4 sm:p-5 border-b border-forest-900/80 bg-forest-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-lg shadow-forest-950/80 border border-emerald-400/30 shrink-0">
                  <Sprout className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-brand text-base sm:text-lg font-normal tracking-wide text-white truncate leading-tight">
                    {settings?.nurseryName || 'ANNADATA NURSERY'}
                  </h1>
                  <p className="text-[10px] text-emerald-300 font-bold tracking-wider uppercase truncate mt-0.5">
                    Nursery Management
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-forest-300 hover:text-white hover:bg-forest-900 transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 max-h-[calc(100vh-210px)] overflow-y-auto">
            <NavLink
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-forest-900/70 transition-all border border-emerald-500/20 mb-2"
            >
              <Home className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Public Landing Page</span>
            </NavLink>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-forest-700 text-white shadow-md shadow-forest-950/80 border border-emerald-400/30'
                        : 'text-forest-100 hover:bg-forest-900/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0 text-emerald-300" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile & Logout Button */}
        <div className="p-4 border-t border-forest-900/80 bg-forest-950/90 space-y-3">
          <div className="flex items-center gap-3 px-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-forest-900 border border-forest-700 flex items-center justify-center text-emerald-300 shrink-0 font-bold text-sm">
              👨‍🌾
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</div>
              <div className="text-[10px] text-forest-300 truncate">{user?.email || 'admin@annadata.com'}</div>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/70 border border-rose-900/50 transition-all shadow-xs active:scale-95"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout from ANNADATA NURSERY? Your session will be ended."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        isDanger={true}
      />
    </>
  );
};

export default Sidebar;
