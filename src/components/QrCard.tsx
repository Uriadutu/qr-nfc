import React, { useState } from 'react';
import { QRCodeItem } from '../types';
import {
  ExternalLink,
  Edit3,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Clock,
  Sparkles,
  QrCode,
  Check,
  Eye,
} from 'lucide-react';

interface QrCardProps {
  item: QRCodeItem;
  baseUrl: string;
  qrPreviewUrl: string;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (item: QRCodeItem) => void;
  onDownload: (item: QRCodeItem) => void;
  onDelete: (id: string) => void;
  onCopyUrl: (url: string, id: string) => void;
  copiedId: string | null;
  onOpenRedirect: (id: string) => void;
}

export const QrCard: React.FC<QrCardProps> = ({
  item,
  baseUrl,
  qrPreviewUrl,
  isSelected,
  onToggleSelect,
  onEdit,
  onDownload,
  onDelete,
  onCopyUrl,
  copiedId,
  onOpenRedirect,
}) => {
  const fullPublicUrl = `${baseUrl.replace(/\/$/, '')}/${item.id}`;
  const isLinked = Boolean(item.targetUrl && item.targetUrl.trim() !== '');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 bg-slate-900/90 backdrop-blur-sm p-4 sm:p-4.5 ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-md hover:shadow-black/30'
      }`}
    >
      {/* Top Header: Checkbox, ID Badge, Scan Counter, & Status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
          />
          <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wide truncate">
            {item.id}
          </span>
          {item.isCustomSlug && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
              Custom
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Real-time Scan Counter Badge di setiap QR */}
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
            title={`Total dipindai: ${item.scanCount ?? 0} kali`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{item.scanCount ?? 0}</span>
            <span className="text-[10px] font-normal text-indigo-400/80">scan</span>
          </div>

          {/* Status Badge */}
          {isLinked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>Aktif</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>Kosong</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle Row: QR Code Thumbnail & Target Information */}
      <div className="flex items-center gap-3 bg-slate-950/70 p-2.5 sm:p-3 rounded-xl border border-slate-800/80 mb-3">
        {/* Clickable QR Thumbnail */}
        <div
          onClick={() => onOpenRedirect(item.id)}
          className="relative group/qr shrink-0 w-20 h-20 sm:w-22 sm:h-22 bg-white p-1 rounded-lg flex items-center justify-center shadow-inner overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
          title="Klik untuk test scan / buka pengalihan QR ini"
        >
          {qrPreviewUrl ? (
            <img
              src={qrPreviewUrl}
              alt={`QR Code ${item.id}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-400">
              <QrCode className="w-7 h-7 animate-pulse text-slate-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-medium transition-opacity">
            <Eye className="w-3.5 h-3.5 mb-0.5 text-indigo-400" />
            <span>Tes Link</span>
          </div>
        </div>

        {/* Target URL details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
            <span>Tautan Tujuan:</span>
          </div>
          <div className="text-xs font-mono text-indigo-300 truncate bg-slate-900 px-2 py-1.5 rounded border border-slate-800">
            {item.targetUrl ? (
              <a
                href={item.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 truncate"
                title={item.targetUrl}
              >
                <span className="truncate">{item.targetUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-slate-500" />
              </a>
            ) : (
              <span className="text-slate-500 italic text-[11px]">Belum diisi</span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
            {item.lastScannedAt ? (
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Terakhir: {new Date(item.lastScannedAt).toLocaleDateString('id-ID')}</span>
              </span>
            ) : (
              <span className="text-slate-600">Belum pernah di-scan</span>
            )}
          </div>
        </div>
      </div>

      {/* Copy Link Section (Optimal untuk NFC & Share) */}
      <div className="text-xs text-slate-400 mb-3 flex items-center justify-between bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
        <span className="truncate text-slate-300 font-mono text-[11px] max-w-[170px] sm:max-w-[190px]">
          /{item.id}
        </span>
        <button
          onClick={() => onCopyUrl(fullPublicUrl, item.id)}
          className={`text-xs flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
            copiedId === item.id
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-indigo-300 hover:text-white hover:bg-slate-700 active:scale-95'
          }`}
          title="Salin URL lengkap QR ini untuk dibagikan atau ditanam ke NFC card"
        >
          {copiedId === item.id ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Action Buttons: Edit, Unduh, Hapus */}
      <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onEdit(item)}
          className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all cursor-pointer"
          title="Ubah URL Tujuan"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onDownload(item)}
          className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white active:scale-95 transition-all cursor-pointer"
          title="Unduh Kartu QR Code Siap Cetak"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh</span>
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          title="Hapus ID QR ini secara permanen"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isDeleting ? '...' : 'Hapus'}</span>
        </button>
      </div>
    </div>
  );
};
