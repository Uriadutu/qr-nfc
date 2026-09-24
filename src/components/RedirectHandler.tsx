import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeItem } from '../types';
import {
  AlertTriangle,
  QrCode,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  Send,
  Lock,
} from 'lucide-react';

interface RedirectHandlerProps {
  id: string;
  onGoHome?: () => void;
  isAdmin?: boolean;
}

export const RedirectHandler: React.FC<RedirectHandlerProps> = ({ id, onGoHome, isAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [qrItem, setQrItem] = useState<QRCodeItem | null>(null);
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'unlinked' | 'not_found' | 'error'>('loading');

  // Input state for user activating their own QR placeholder
  const [inputUrl, setInputUrl] = useState('');
  const [inputError, setInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  // Guard flag to prevent React 19 StrictMode double execution incrementing counter twice
  const hasIncrementedRef = useRef(false);

  const currentQrShareUrl = window.location.href;

  useEffect(() => {
    let isCancelled = false;

    const checkRedirect = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'qr_codes', id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          if (!isCancelled) {
            setStatus('not_found');
            setLoading(false);
          }
          return;
        }

        const data = snapshot.data() as QRCodeItem;
        if (!isCancelled) {
          setQrItem(data);
        }

        // Jika link sudah ada, lakukan direct redirect & catat 1 kali scan
        if (data.targetUrl && data.targetUrl.trim() !== '') {
          // Prevent double increment
          if (!hasIncrementedRef.current) {
            hasIncrementedRef.current = true;
            try {
              await updateDoc(docRef, {
                scanCount: increment(1),
                lastScannedAt: Date.now(),
              });
            } catch (err) {
              console.error('Failed to update scan stats:', err);
            }
          }

          let target = data.targetUrl.trim();
          if (!target.startsWith('http://') && !target.startsWith('https://')) {
            target = `https://${target}`;
          }

          // Direct immediate redirect
          window.location.replace(target);
          return;
        } else {
          // Link masih kosong!
          if (!isCancelled) {
            setStatus('unlinked');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching redirect:', err);
        if (!isCancelled) {
          setStatus('error');
          setLoading(false);
        }
      }
    };

    if (id) {
      checkRedirect();
    }

    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Handle user filling in the target link for THIS placeholder only
  const handleUserSetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    let clean = inputUrl.trim();
    if (!clean) {
      setInputError('Silakan masukkan link URL tujuan.');
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }

    try {
      new URL(clean);
    } catch {
      setInputError('Format link tidak valid. Masukkan URL seperti: https://instagram.com/akunanda');
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'qr_codes', id);
      await updateDoc(docRef, {
        targetUrl: clean,
        updatedAt: Date.now(),
      });
      setSuccessSaved(true);

      // Langsung redirect tanpa konfirmasi
      setTimeout(() => {
        window.location.replace(clean);
      }, 500);
    } catch (err) {
      console.error('Failed to set link:', err);
      setInputError('Gagal menyimpan tautan ke Firestore. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentQrShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-1">Memeriksa Link QR...</h2>
        <p className="text-xs text-slate-400 font-mono">Kode ID: {id}</p>
      </div>
    );
  }

  // Jika sedang diproses redirect instan
  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-1">Mengalihkan Langsung...</h2>
        <p className="text-xs text-slate-400 font-mono">ID: {id}</p>
      </div>
    );
  }

  // Placeholder Khusus untuk QR ini (Mobile optimized)
  if (status === 'unlinked') {
    return (
      <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 relative selection:bg-indigo-500 selection:text-white">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),rgba(255,255,255,0))] pointer-events-none" />

        <div className="w-full max-w-md mx-auto my-auto relative">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden">
            {/* Top Amber Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500" />

            {/* Header & QR Badge */}
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Placeholder QR
                </span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                ID: {id}
              </div>
            </div>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-amber-500/5">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Link Belum Diaktifkan
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                QR Code ID <span className="font-mono text-indigo-300 font-bold">{id}</span> belum memiliki tujuan. Masukkan link di bawah untuk mengaktifkan kartu QR ini.
              </p>
            </div>

            {/* Tombol Copy Link QR ini */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mb-4 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                  Link QR Ini:
                </span>
                <span className="text-xs font-mono text-slate-300 truncate block">
                  {currentQrShareUrl}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                title="Salin Link QR ini"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Form aktivasi */}
            <form onSubmit={handleUserSetLink} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Masukkan Link Tujuan Anda:
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (inputError) setInputError('');
                  }}
                  placeholder="https://instagram.com/toko atau https://wa.me/..."
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  disabled={isSubmitting || successSaved}
                  autoFocus
                />
                {inputError && (
                  <p className="mt-1.5 text-xs text-red-400">{inputError}</p>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 mr-1 self-center">Template:</span>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://wa.me/')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://instagram.com/')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setInputUrl('https://maps.google.com/')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  Maps
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || successSaved}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan & Mengalihkan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Aktifkan & Buka Link</span>
                  </>
                )}
              </button>
            </form>

            {/* Isolation Notice */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Terisolasi hanya untuk QR {id}</span>
              </span>

              {isAdmin && onGoHome && (
                <button
                  onClick={onGoHome}
                  className="text-indigo-400 hover:underline cursor-pointer"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pb-2 text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-slate-600" />
          <span>Dynamic QR & NFC Redirect System</span>
        </div>
      </div>
    );
  }

  // Error State (e.g. Firebase rules or network error)
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-amber-300 border border-slate-700">
            ID: {id}
          </span>

          <h1 className="text-xl font-bold text-white mt-3 mb-2">Kendala Akses Firestore</h1>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Tidak dapat membaca data QR dari Firestore. Hal ini biasanya terjadi jika aturan (Rules) Firestore pada project Anda belum diizinkan atau koneksi terputus.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Muat Ulang</span>
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
              >
                <span>Ke Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto mb-4 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          ID: {id}
        </span>

        <h1 className="text-xl font-bold text-white mt-3 mb-2">QR Code Tidak Ditemukan</h1>
        <p className="text-xs text-slate-400 mb-5">
          Kode QR dengan ID <span className="font-mono text-white">"{id}"</span> belum terdaftar di sistem.
        </p>

        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>Ke Halaman Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
