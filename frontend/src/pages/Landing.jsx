import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  CheckCircle2,
  Receipt,
  Users,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, settings } = useAuth();

  const handleLaunchPortal = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO SECTION WITH MOTION BACKGROUND */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/assets/nursery_hero_bg.jpg"
            alt="Nursery Greenhouse Background"
            className="w-full h-full object-cover animate-pan-motion brightness-50 contrast-110 opacity-70"
          />
          {/* Motion Ambient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-emerald-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,163,74,0.25)_0%,transparent_70%)] animate-pulse-glow" />
        </div>

        {/* Floating Particles Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-10 text-emerald-400/40 animate-float-slow text-2xl">🌱</div>
          <div className="absolute top-1/3 right-16 text-emerald-400/30 animate-float-fast text-3xl">🌿</div>
          <div className="absolute bottom-1/4 left-1/4 text-emerald-300/30 animate-float-slow text-xl">🌾</div>
          <div className="absolute bottom-1/3 right-1/3 text-emerald-400/40 animate-float-fast text-2xl">✨</div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>ANNADATA NURSERY • Official Management Portal</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-md">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-emerald-100 to-teal-200">
                {settings?.nurseryName || 'ANNADATA NURSERY'}
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-emerald-400 tracking-wide">
              {settings?.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Empowering nursery operations with batch-level stock tracking, POS billing, instant thermal receipt printing, WhatsApp customer sharing, and Excel data backup for farmers and growers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchPortal}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-3 text-base transition-all transform hover:-translate-y-0.5"
            >
              <span>{user ? 'Open Dashboard' : 'Login to Admin Portal'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#varieties"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-slate-100 border border-white/15 font-semibold rounded-2xl backdrop-blur-md transition-all flex items-center justify-center gap-2 text-base"
            >
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>Browse Seedlings</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-6">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">50,000+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Seedlings Produced</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">1,200+</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Farmers Served</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">99.8%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Germination Success</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Disease Resistant</div>
          </div>
        </div>
      </section>

      {/* 3. SEEDLING VARIETIES SHOWCASE */}
      <section id="varieties" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Premium Crop Selection</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Popular Seedling Varieties</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            High-yield Tomato, Mirchi, Brinjal, and Cabbage seedlings grown under expert nursery conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Tomato Hybrid 101', crop: 'Tomato', rate: '₹1.20', badge: 'Best Seller', desc: 'High yield & disease resistant hybrid variety.' },
            { name: 'Mirchi Hybrid 702', crop: 'Mirchi', rate: '₹0.90', badge: 'High Pungency', desc: 'Pest resistant spicy chilli seedling.' },
            { name: 'Brinjal Purple Round', crop: 'Brinjal', rate: '₹1.00', badge: 'Premium', desc: 'Glossy purple round brinjal variety.' },
            { name: 'Cabbage Golden Acre', crop: 'Cabbage', rate: '₹1.50', badge: 'Fast Growing', desc: 'Compact head fast maturing cabbage.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {item.badge}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">{item.rate}</span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Category: {item.crop}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SYSTEM FEATURES GRID */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Enterprise Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full-Stack Nursery System</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-800">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Batch Stock Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Batch-wise tracking with sowing dates, ready dates, stock deduction on bill creation, and wastage logging.
              </p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-800">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">POS Billing & Thermal Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fast POS billing with multi-item calculations, payment modes (Cash, UPI, Credit), thermal receipts, and WhatsApp link sharing.
              </p>
            </div>

            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-800">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Excel Backup & Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-sheet Excel exports for customer profiles, sales transactions, stock audits, and Profit/Loss reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-900 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
              🌱
            </div>
            <div>
              <p className="font-bold text-slate-300">{settings?.nurseryName || 'ANNADATA NURSERY'}</p>
              <p className="text-[11px] text-slate-500">{settings?.tagline || 'Quality Seedlings • Better Yield • Farmer Trust'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Admin Login Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
