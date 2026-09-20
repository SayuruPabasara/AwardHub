import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAwardHub } from '../../context/AwardHubContext';

export default function Toast() {
  const { toast } = useAwardHub();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-emerald-500/10',
    error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 shadow-rose-500/10',
    info: 'border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 shadow-blue-500/10'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{toast.message}</p>
      </div>
    </div>
  );
}
