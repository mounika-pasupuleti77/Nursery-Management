import React from 'react';

const StatCard = ({ title, value, subtext, trend, icon: Icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80'
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.emerald} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">{value}</div>

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
        <span className="text-slate-500 font-medium truncate">{subtext}</span>
        {trend && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ml-1">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
