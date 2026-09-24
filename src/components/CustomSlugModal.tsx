import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Sparkles, X, Check, AlertCircle, Loader2, Globe } from 'lucide-react';

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
  const [targetUrl, setTargetUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSlug('');
      setTargetUrl('');
      setIsAvailable(null);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Debounced Link Checker
  useEffect(() => {
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!clean) {
      setIsAvailable(null);
      setErrorMsg('');
      return;
    }

    if (clean.length < 2) {
      setIsAvailable(null);
      setErrorMsg('ID kustom minimal 2 karakter.');
      return;
    }

    const checkTimer = setTimeout(async () => {
      setChecking(true);
      setErrorMsg('');
      try {
        const docRef = doc(db, 'qr_codes', clean);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setIsAvailable(false);
          setErrorMsg(`Link/ID "${clean}" sudah digunakan orang lain. Gunakan nama unik lain!`);
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
    const cleanId = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!cleanId) {
      setErrorMsg('Harap masukkan ID/slug kustom.');
      return;
    }

    if (isAvailable === false) {
      setErrorMsg('ID ini sudah digunakan, silakan pilih yang lain.');
      return;
    }

    let finalUrl = targetUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    setIsSaving(true);
    try {
      // Re-verify availability
      const docRef = doc(db, 'qr_codes', cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setIsAvailable(false);
        setErrorMsg('Maaf, ID baru saja dipakai oleh pengguna lain.');
        setIsSaving(false);
        return;
      }

      await setDoc(docRef, {
        id: cleanId,
        targetUrl: finalUrl,
        createdAt: Date.now(),
        scanCount: 0,
        isCustomSlug: true,
      });

      onSuccess(cleanId);
    } catch (err) {
      console.error('Error creating custom QR:', err);
      setErrorMsg('Gagal membuat ID kustom.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Buat Custom Link / Slug</h2>
              <p className="text-xs text-slate-400">Buat link pendek yang mudah diingat</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom ID / Slug Unik:
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs text-slate-500 select-none">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="misal: promo-merdeka, menu, toko-jaya"
                className={`w-full pl-7 pr-10 py-2.5 rounded-xl bg-slate-800/80 border text-white font-mono text-sm focus:outline-none focus:ring-1 ${
                  isAvailable === true
                    ? 'border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500'
                    : isAvailable === false
                    ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500'
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
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>

            {/* Availability Checker status */}
            <div className="mt-1.5 min-h-[20px]">
              {checking ? (
                <span className="text-xs text-slate-400">Memeriksa ketersediaan slug...</span>
              ) : isAvailable === true ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Link tersedia dan siap digunakan!
                </span>
              ) : errorMsg ? (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errorMsg}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Gunakan huruf kecil, angka, atau tanda hubung (-).
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Link URL Tujuan (Boleh Kosong / Placeholder):</span>
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://website.com/halaman-khusus (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Jika dikosongkan, halaman placeholder akan muncul saat QR discan dan siap diaktifkan.
            </p>
          </div>

          {/* Full Custom URL Preview */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 block text-[11px] mb-1">Pratinjau Link QR:</span>
            <span className="font-mono text-indigo-300 break-all">
              {currentShortBaseUrl}/{slug || '[custom-slug]'}
            </span>
          </div>

          {/* Action buttons */}
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
