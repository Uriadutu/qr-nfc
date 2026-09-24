import React, { useState } from 'react';
import { Smartphone, Copy, Check } from 'lucide-react';

interface NfcInfoBannerProps {
  baseUrl: string;
}

export const NfcInfoBanner: React.FC<NfcInfoBannerProps> = ({ baseUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <Smartphone className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px] font-medium">Format URL NFC / QR:</span>
            <span className="font-mono text-indigo-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] truncate max-w-full">
              /{'{id}'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            Cukup salin link kartu untuk diprogram ke NFC Tag / stiker QR / bio link.
          </p>
        </div>
      </div>

      <button
        onClick={handleCopy}
        className="self-start sm:self-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-semibold transition-all cursor-pointer border border-slate-700/60"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Base URL</span>
          </>
        )}
      </button>
    </div>
  );
};
