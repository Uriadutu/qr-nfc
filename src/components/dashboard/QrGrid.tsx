import React from 'react';
import { QRCodeItem } from '../../types';
import { QrCard } from '../QrCard';
import { FirestoreErrorBanner } from '../FirestoreErrorBanner';
import { FirestoreErrorDetail } from '../../hooks/useQrCodes';
import { RefreshCw, QrCode, Layers, Sparkles } from 'lucide-react';

interface QrGridProps {
  loading: boolean;
  error: FirestoreErrorDetail | null;
  onRetry: () => void;
  items: QRCodeItem[];
  searchQuery: string;
  statusFilter: string;
  baseUrl: string;
  previews: Record<string, string>;
  selectedIds: Set<string>;
  copiedId: string | null;
  onToggleSelect: (id: string) => void;
  onEdit: (item: QRCodeItem) => void;
  onDownload: (item: QRCodeItem) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string, id: string) => void;
  onOpenRedirect: (id: string) => void;
  onOpenBulk: () => void;
  onOpenCustomSlug: () => void;
}

export const QrGrid: React.FC<QrGridProps> = ({
  loading,
  error,
  onRetry,
  items,
  searchQuery,
  statusFilter,
  baseUrl,
  previews,
  selectedIds,
  copiedId,
  onToggleSelect,
  onEdit,
  onDownload,
  onDelete,
  onCopyUrl,
  onOpenRedirect,
  onOpenBulk,
  onOpenCustomSlug,
}) => {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <h3 className="text-sm font-semibold text-white">Memuat data dari Firestore...</h3>
        <p className="text-xs text-slate-400 mt-0.5">Sinkronisasi status QR real-time</p>
      </div>
    );
  }

  // Jika terjadi error koneksi atau izin aturan Firestore
  if (error) {
    return <FirestoreErrorBanner error={error} onRetry={onRetry} />;
  }

  if (items.length === 0) {
    const isFiltered = searchQuery || statusFilter !== 'all';
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <QrCode className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">
          {isFiltered ? 'Tidak ada QR yang cocok' : 'Belum Ada QR Code'}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-5">
          {isFiltered
            ? 'Ubah filter atau bersihkan kata kunci pencarian di atas.'
            : 'Mulai dengan Bulk Generate massal atau buat Custom Slug unik.'}
        </p>
        {!isFiltered && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={onOpenBulk}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Generate qr001 - qr100</span>
            </button>
            <button
              onClick={onOpenCustomSlug}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-semibold text-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Buat Slug Kustom</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <QrCard
          key={item.id}
          item={item}
          baseUrl={baseUrl}
          qrPreviewUrl={previews[item.id]}
          isSelected={selectedIds.has(item.id)}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDownload={onDownload}
          onDelete={onDelete}
          onCopyUrl={onCopyUrl}
          copiedId={copiedId}
          onOpenRedirect={onOpenRedirect}
        />
      ))}
    </div>
  );
};
