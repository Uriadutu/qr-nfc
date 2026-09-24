import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirestoreErrorBannerProps {
  error: {
    code: string;
    message: string;
    isPermissionDenied: boolean;
    isNotFound: boolean;
  };
  onRetry: () => void;
}

const RECOMMENDED_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /qr_codes/{id} {
      // Akses publik untuk scan redirect & dashboard QR
      allow read, write: if true;
    }
  }
}`;

export const FirestoreErrorBanner: React.FC<FirestoreErrorBannerProps> = ({ error, onRetry }) => {
  const [copiedRules, setCopiedRules] = useState(false);
  const projectId = firebaseConfig.projectId || 'qr-nfc-5e7cb';
  const rulesConsoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/rules`;
  const dbConsoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(RECOMMENDED_RULES);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  return (
    <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-5 sm:p-7 text-left max-w-2xl mx-auto my-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {error.isPermissionDenied
                ? 'Izin Akses Firestore Perlu Diaktifkan'
                : error.isNotFound
                ? 'Database Firestore Belum Dibuat'
                : 'Koneksi Firestore Mengalami Masalah'}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Project: {projectId}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {error.isPermissionDenied ? (
              <>
                Firebase project baru Anda (<strong>{projectId}</strong>) masih menggunakan aturan proteksi default (<strong>Permission Denied</strong>). Agar aplikasi dapat membaca & menyimpan data QR Code, aktifkan aturan akses di Firebase Console.
              </>
            ) : error.isNotFound ? (
              <>
                Database Firestore pada project <strong>{projectId}</strong> belum dibuat di Firebase Console.
              </>
            ) : (
              error.message
            )}
          </p>

          {/* Langkah Perbaikan */}
          <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>Langkah Cepat Mengaktifkan:</span>
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs">
              <li>
                Buka tab aturan di Firebase Console:{' '}
                <a
                  href={rulesConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-semibold ml-1"
                >
                  <span>Buka Firestore Rules ({projectId})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                (Jika database belum ada, klik <strong>Create Database</strong> di{' '}
                <a
                  href={dbConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  sini <ExternalLink className="w-2.5 h-2.5" />
                </a>
                ).
              </li>
              <li>
                Salin dan tempel kode aturan (Rules) berikut ke tab <strong>Rules</strong>:
              </li>
            </ol>

            {/* Code Box with Copy */}
            <div className="relative mt-2">
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
                {RECOMMENDED_RULES}
              </pre>
              <button
                onClick={handleCopyRules}
                className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold border border-slate-700 transition-all cursor-pointer shadow"
              >
                {copiedRules ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-300" />
                    <span>Salin Rules</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              4. Klik tombol <strong>Publish</strong> di Firebase Console, lalu tekan tombol <strong>Coba Lagi</strong> di bawah.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi / Refresh Koneksi</span>
            </button>
            <a
              href={rulesConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <span>Buka Console</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
