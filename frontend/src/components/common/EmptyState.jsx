import React from 'react';
import { Sprout } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'There are no items to display at the moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-4">
      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 text-emerald-600 border border-emerald-100">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
