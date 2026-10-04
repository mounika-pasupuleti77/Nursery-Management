import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sprout, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Leaf } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@annadata.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const { login, settings } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      addToast('Welcome back! Logged in successfully.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid login credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@annadata.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 font-sans overflow-hidden">
      {/* LEFT SIDE: SPLIT BANNER WITH CLEAR NURSERY BACKGROUND */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-forest-900/50">
        {/* Real Nursery Background Image - Clear & Vibrant */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center animate-pan-motion"
          style={{ backgroundImage: "url('/assets/nursery_login_split.jpg')" }}
        />
        {/* Soft Translucent Green Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-tr from-forest-950/95 via-forest-900/80 to-slate-950/85 backdrop-blur-[1px]" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-lg border border-emerald-400/40">
            <Sprout className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-brand text-2xl font-normal text-white leading-none">
              {settings?.nurseryName || 'ANNADATA NURSERY'}
            </h1>
            <p className="text-xs text-emerald-300 font-semibold tracking-wider uppercase mt-1">
              Management Portal
            </p>
          </div>
        </div>

        {/* Middle Branding Text & Features */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              Quality Seedlings • Better Yield • Farmer Trust
            </span>
            <h2 className="font-brand text-4xl text-white font-normal leading-tight pt-2">
              Empowering Plant & Seedling Nurseries
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Manage Tomato, Mirchi, Brinjal, and custom seedling batches, record wastage, process live POS credit billing, and generate instant printable receipts & WhatsApp reminders.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Batch-wise Stock Calculation (Initial - Sold - Wastage)',
              'Live POS Billing & Thermal Receipt Printing',
              'WhatsApp Bill Sharing & Payment Reminders',
              'Multi-sheet Excel Exports (Customers, Stock, Expenses)'
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-emerald-100 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span>© 2026 ANNADATA NURSERY</span>
          <Link to="/" className="text-emerald-300 hover:underline flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: CLEAN MODERN LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900/90 relative">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-forest-700" />
              <span className="font-brand text-xl text-slate-900">
                {settings?.nurseryName || 'ANNADATA NURSERY'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your email and password to open management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@annadata.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm shadow-lg shadow-forest-950/40 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Testing credentials:</span>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-forest-700 hover:text-forest-800 font-bold underline underline-offset-2"
            >
              Use Admin Demo Login
            </button>
          </div>

          <div className="mt-4 pt-3 text-center lg:hidden">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-800">
              ← Return to Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
