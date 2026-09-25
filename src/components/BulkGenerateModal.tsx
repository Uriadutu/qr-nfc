import React, { useState } from 'react';
import { Layers, X, HelpCircle, Loader2 } from 'lucide-react';

interface BulkGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    prefix: string;
    startNum: number;
    count: number;
    padLength: number;
    initialUrl?: string;
  }) => Promise<void>;
  isGenerating: boolean;
}

export const BulkGenerateModal: React.FC<BulkGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [prefix, setPrefix] = useState('qr');
  const [startNum, setStartNum] = useState(1);
  const [count, setCount] = useState(100);
  const [padLength, setPadLength] = useState(3);
  const [initialUrl, setInitialUrl] = useState('');

  if (!isOpen) return null;

  const exampleStart = `${prefix}${String(startNum).padStart(padLength, '0')}`;
  const exampleEnd = `${prefix}${String(startNum + count - 1).padStart(padLength, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0) return;
    await onGenerate({
      prefix: prefix.trim().toLowerCase(),
      startNum,
      count,
      padLength,
      initialUrl: initialUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generate QR Massal (Bulk)</h2>
              <p className="text-xs text-slate-400">Buat puluhan hingga ratusan ID QR secara otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prefix ID
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="misal: qr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Digit Nol (Padding)
              </label>
              <select
                value={padLength}
                onChange={(e) => setPadLength(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>1 digit (qr1)</option>
                <option value={2}>2 digit (qr01)</option>
                <option value={3}>3 digit (qr001)</option>
                <option value={4}>4 digit (qr0001)</option>
                <option value={5}>5 digit (qr00001)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nomor Mulai
              </label>
              <input
                type="number"
                min={1}
                value={startNum}
                onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jumlah ID (Count)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Link Awal / Default (Opsional)
              </label>
              <span className="text-[11px] text-slate-400">Kosongkan jika placeholder</span>
            </div>
            <input
              type="url"
              value={initialUrl}
              onChange={(e) => setInitialUrl(e.target.value)}
              placeholder="https://contoh.com/landing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Live Preview of Range */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Pratinjau Hasil Generate Massal:</span>
              </div>
              <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Total: {count} QR
              </span>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-slate-300 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Label / Tampilan Card:</span>
                <span className="font-bold text-white">/{exampleStart} s/d /{exampleEnd}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Link Akses &amp; Scan:</span>
                <span className="text-indigo-300 font-bold">/{'{random6}'} (6 Karakter Acak)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Setiap barcode memiliki link acak unik 6 karakter (0-9, a-z, A-Z) yang aman dan otomatis tersambung ke label berurutannya.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-transparent hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Firestore...</span>
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Generate {count} QR Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
