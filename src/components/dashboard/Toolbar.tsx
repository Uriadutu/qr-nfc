import React from 'react';
import { Search, CheckCircle2, AlertCircle, Download, Trash2 } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'active' | 'empty';
  onFilterChange: (filter: 'all' | 'active' | 'empty') => void;
  totalCount: number;
  activeCount: number;
  emptyCount: number;
  filteredCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
  zipProgress: { current: number; total: number } | null;
  onDeleteSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterChange,
  totalCount,
  activeCount,
  emptyCount,
  filteredCount,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onDownloadZip,
  isDownloadingZip,
  zipProgress,
  onDeleteSelected,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari ID unik (misal qr001, 001) atau link tujuan..."
            className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => onFilterChange('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Aktif ({activeCount})
          </button>
          <button
            onClick={() => onFilterChange('empty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'empty'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Kosong ({emptyCount})
          </button>
        </div>
      </div>

      {/* Action Row for Bulk / Selection */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white font-medium cursor-pointer"
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={onToggleSelectAll}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
            />
            <span className="text-[11px] sm:text-xs">Pilih Semua ({filteredCount})</span>
          </button>

          {selectedCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
              {selectedCount} dipilih
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Download ZIP */}
          <button
            onClick={onDownloadZip}
            disabled={isDownloadingZip || (filteredCount === 0 && selectedCount === 0)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            title="Download QR sebagai ZIP"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {isDownloadingZip
                ? `${zipProgress?.current || 0}/${zipProgress?.total || 0}...`
                : selectedCount > 0
                ? `Unduh (${selectedCount}) ZIP`
                : 'Unduh ZIP'}
            </span>
          </button>

          {/* Bulk Delete */}
          {selectedCount > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
