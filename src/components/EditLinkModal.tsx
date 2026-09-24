import React, { useState, useEffect } from 'react';
import { QRCodeItem } from '../types';
import { Edit3, X, Globe, Save, Loader2, Trash2 } from 'lucide-react';

interface EditLinkModalProps {
  item: QRCodeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, newUrl: string) => Promise<void>;
  onClear: (id: string) => Promise<void>;
  isSaving: boolean;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onClear,
  isSaving,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setUrl(item.targetUrl || '');
      setError('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (cleanUrl) {
      // Validate simple URL format
      try {
        new URL(cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`);
      } catch {
        setError('Format URL tidak valid. Contoh: https://google.com atau https://tokoku.id');
        return;
      }
    }

    const finalUrl = cleanUrl
      ? cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')
        ? cleanUrl
        : `https://${cleanUrl}`
      : '';

    await onSave(item.id, finalUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Link Tujuan</h2>
              <p className="text-xs text-slate-400 font-mono">ID: {item.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>URL Tujuan Pengalihan (Redirect Target)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://instagram.com/tokoanda atau https://website.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
              autoFocus
            />
            {error ? (
              <p className="mt-1.5 text-xs text-red-400">{error}</p>
            ) : (
              <p className="mt-1.5 text-[11px] text-slate-400">
                Ketika QR dipindai, pengunjung akan langsung dialihkan (redirect 302) ke link ini.
              </p>
            )}
          </div>

          {/* Quick link shortcuts */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-slate-400 block mb-1.5 font-medium">Template Cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setUrl('https://wa.me/6281234567890')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://instagram.com/')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://linktr.ee/')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                Linktree
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://maps.google.com/')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
              >
                Google Maps
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {item.targetUrl ? (
              <button
                type="button"
                onClick={() => onClear(item.id)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer border border-amber-500/20"
                title="Kosongkan link agar status kembali menjadi 'Kosong'"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan Link</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-transparent hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
