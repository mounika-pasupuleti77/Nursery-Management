import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500 min-h-[200px]">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
