import React from 'react';
import { QrCode, Layers, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  onOpenCustomSlug: () => void;
  onOpenBulkGenerate: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenCustomSlug,
  onOpenBulkGenerate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                QR & NFC Hub
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 truncate hidden xs:block">
              Auto Redirect & Mass Generator
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenCustomSlug}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 active:scale-95 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Buat Custom Slug"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+ Custom Slug</span>
            <span className="xs:hidden">+ Slug</span>
          </button>

          <button
            onClick={onOpenBulkGenerate}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Bulk</span>
          </button>
        </div>
      </div>
    </header>
  );
};
