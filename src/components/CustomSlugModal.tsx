import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Sparkles, X, Check, AlertCircle, Loader2, Globe, RefreshCw, KeyRound, ShieldAlert } from 'lucide-react';
import { generateRandom6Char } from '../utils/qrHelper';
import { createCustomSlugItem } from '../services/qrService';

interface CustomSlugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newId: string) => void;
  currentShortBaseUrl: string;
}

export const CustomSlugModal: React.FC<CustomSlugModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentShortBaseUrl,
}) => {
  const [slug, setSlug] = useState('');
  const [randomKey, setRandomKey] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSlug('');
      setTargetUrl('');
      setRandomKey(generateRandom6Char());
      setIsAvailable(null);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Regenerate random 6-character key
  const handleRegenerateRandomKey = () => {
    setRandomKey(generateRandom6Char());
  };

  // Debounced Custom Slug Checker (Check if slug is already registered)
  useEffect(() => {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) {
      setIsAvailable(null);
      setErrorMsg('');
      return;
    }

    if (clean.length < 2) {
      setIsAvailable(null);
      setErrorMsg('ID / Slug kustom minimal 2 karakter.');
      return;
    }

    const checkTimer = setTimeout(async () => {
      setChecking(true);
      setErrorMsg('');
      try {
        // Check direct document ID
        const docRef = doc(db, 'qr_codes', clean);
        const snap = await getDoc(docRef);
        
        // Check query by customSlug field
        const slugQuery = query(collection(db, 'qr_codes'), where('customSlug', '==', clean));
        const slugQuerySnap = await getDocs(slugQuery);

        if (snap.exists() || !slugQuerySnap.empty) {
          setIsAvailable(false);
          setErrorMsg(`Slug/Nama "${clean}" sudah digunakan. Silakan gunakan nama lain!`);
        } else {
          setIsAvailable(true);
          setErrorMsg('');
        }
      } catch (err) {
        console.error('Error checking slug:', err);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => clearTimeout(checkTimer);
  }, [slug]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!cleanSlug) {
      setErrorMsg('Harap masukkan ID / Slug kustom.');
      return;
    }

    if (isAvailable === false) {
      setErrorMsg('ID/Slug ini sudah digunakan, silakan pilih nama lain.');
      return;
    }

    let finalUrl = targetUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsSaving(true);
    try {
      const activeRandomKey = randomKey.trim() || generateRandom6Char();
      const result = await createCustomSlugItem(cleanSlug, finalUrl, activeRandomKey);
      onSuccess(result.id);
    } catch (err: unknown) {
      console.error('Error creating custom QR:', err);
      const msg = err instanceof Error ? err.message : 'Gagal membuat ID kustom.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const activeRedirectUrl = `${currentShortBaseUrl.replace(/\/+$/, '')}/${randomKey || '[random6]'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buat Custom Link / Slug</h2>
              <p className="text-xs text-slate-400">
                Nama kustom tampil di card, link akses otomatis menggunakan 6 karakter unik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Custom Slug Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Custom ID / Nama Slug:</span>
              <span className="text-[11px] text-slate-500 font-normal">Tampil pada Card & Filter</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs text-slate-500 select-none">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="misal: menu, promo-natal, vip-card"
                className={`w-full pl-7 pr-10 py-2.5 rounded-xl bg-slate-800/80 border text-white font-mono text-sm focus:outline-none focus:ring-1 ${
                  isAvailable === true
                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500'
                    : isAvailable === false
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                required
                autoFocus
              />
              <div className="absolute right-3 flex items-center">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                {!checking && isAvailable === true && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
                {!checking && isAvailable === false && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            {/* Availability status message */}
            <div className="mt-1.5 min-h-[18px]">
              {checking ? (
                <span className="text-xs text-slate-400">Memeriksa ketersediaan slug...</span>
              ) : isAvailable === true ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Nama slug &quot;{slug}&quot; tersedia!
                </span>
              ) : errorMsg ? (
                <span className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Gunakan huruf, angka, atau strip (misal: <code className="text-indigo-300">menu</code>).
                </span>
              )}
            </div>
          </div>

          {/* Random 6-Character Key Section */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Link Unik 6 Karakter (0-9, a-z, A-Z):</span>
              </span>
              <button
                type="button"
                onClick={handleRegenerateRandomKey}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer"
                title="Acak ulang 6 karakter random"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Acak Ulang</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700/70 font-mono text-sm font-bold text-indigo-300 flex items-center justify-between">
                <span>/{randomKey}</span>
                <span className="text-[10px] text-slate-500 font-normal">6 Karakter Random</span>
              </div>
            </div>
          </div>

          {/* Destination URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link URL Tujuan (Boleh Kosong / Placeholder):</span>
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://website.com/menu (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Jika dikosongkan, halaman placeholder akan muncul saat QR discan dan siap diisi kapan saja.
            </p>
          </div>

          {/* Live Full Redirect Preview */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/90 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
              <span>Link QR &amp; NFC yang akan di-copy / diakses:</span>
              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold text-[10px]">
                {slug ? `/${slug}` : 'Custom Slug'}
              </span>
            </div>
            <div className="font-mono text-indigo-300 font-semibold break-all bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              {activeRedirectUrl}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
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
              disabled={isSaving || checking || isAvailable === false || !slug.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Custom Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
