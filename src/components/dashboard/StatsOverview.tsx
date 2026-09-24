import React from 'react';
import { QrCode, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    total: number;
    active: number;
    empty: number;
    totalScans: number;
  };
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
      <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4.5 rounded-2xl">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium">Total QR</span>
          <QrCode className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-xl sm:text-3xl font-bold text-white tracking-tight">
          {stats.total}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Tersimpan di cloud</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4.5 rounded-2xl">
        <div className="flex items-center justify-between text-emerald-400 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Link Aktif</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
          {stats.active}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Auto redirect</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4.5 rounded-2xl">
        <div className="flex items-center justify-between text-amber-400 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Placeholder</span>
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl sm:text-3xl font-bold text-amber-400 tracking-tight">
          {stats.empty}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Siap diisi di linknya</p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4.5 rounded-2xl">
        <div className="flex items-center justify-between text-indigo-400 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Total Scan</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-xl sm:text-3xl font-bold text-indigo-300 tracking-tight">
          {stats.totalScans}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Akurat & 1x per scan</p>
      </div>
    </div>
  );
};
