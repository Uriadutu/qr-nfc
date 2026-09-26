import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { NotFound } from './NotFound';
import {
  Lock,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Save,
  Check,
  KeyRound,
  ArrowLeft,
  Link2,
  Eye,
  EyeOff,
  Delete,
  ShieldCheck,
  AlertCircle,
  Settings,
  X,
  Pencil,
  ChevronUp,
  ChevronDown,
  User,
  Sparkles,
} from 'lucide-react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa6';
import { SiShopee, SiGooglemaps } from 'react-icons/si';
import { getPlatformInfo, LinkIcon } from './LinkIcon';

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface LinkTreeEditorProps {
  id: string;
  onGoBack?: () => void;
}

// ─── PIN Lock Screen (self-contained for this editor) ─────────────────────────
const EditorPinLock: React.FC<{
  qrId: string;
  onSuccess: () => void;
}> = ({ qrId, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showDigits, setShowDigits] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const handleDigitPress = (digit: string) => {
    if (loading || isSuccess) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (loading || isSuccess) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (loading || isSuccess) return;
    setPin('');
    setErrorMsg(null);
  };

  const submitPin = async (pinToTest: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const cleanInput = pinToTest.trim();
      const settingPinRef = doc(db, 'setting', 'pin');
      const settingPinSnap = await getDoc(settingPinRef);

      if (!settingPinSnap.exists()) {
        setIsShaking(true);
        setErrorMsg('PIN belum dikonfigurasi di database (setting > pin).');
        setTimeout(() => { setIsShaking(false); setPin(''); }, 600);
        setLoading(false);
        return;
      }

      const data = settingPinSnap.data();

      // Check per-id PIN first, then fallback to "user" field
      const expectedPin = data?.[qrId] ?? data?.user;

      if (expectedPin === undefined || expectedPin === null) {
        setIsShaking(true);
        setErrorMsg('PIN belum dikonfigurasi (field "user" di setting > pin).');
        setTimeout(() => { setIsShaking(false); setPin(''); }, 600);
        setLoading(false);
        return;
      }

      const expectedPinStr = String(expectedPin).trim();
      if (cleanInput === expectedPinStr) {
        setIsSuccess(true);
        setTimeout(() => onSuccess(), 500);
      } else {
        setIsShaking(true);
        setErrorMsg('PIN yang dimasukkan salah.');
        setTimeout(() => { setIsShaking(false); setPin(''); hiddenInputRef.current?.focus(); }, 600);
      }
    } catch (err) {
      console.error('PIN verify error:', err);
      setIsShaking(true);
      setErrorMsg('Gagal memverifikasi PIN. Periksa koneksi internet.');
      setTimeout(() => { setIsShaking(false); setPin(''); }, 600);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || isSuccess) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, loading, isSuccess]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden input for mobile keyboard */}
      <input
        ref={hiddenInputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
          setPin(val);
          if (val.length === 4) submitPin(val);
        }}
        className="opacity-0 absolute -top-96 left-0 w-1 h-1 pointer-events-none"
        aria-hidden="true"
        autoFocus
      />

      <div
        onClick={() => hiddenInputRef.current?.focus()}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative z-10 flex flex-col items-center"
      >
        {/* Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-6">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Verifikasi Akses Link Editor</span>
        </div>

        {/* Icon */}
        <div className="relative mb-5">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${isSuccess
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20 scale-105'
              : errorMsg
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-violet-600/30 border border-violet-500/30 text-violet-400 shadow-violet-500/15'
              }`}
          >
            {loading ? (
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-violet-400" />
            ) : isSuccess ? (
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center">
          {isSuccess ? 'Akses Diterima!' : 'Masukkan 4 Digit PIN'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 text-center mt-1.5 mb-6 max-w-xs">
          {isSuccess
            ? 'Membuka Link Editor...'
            : <>PIN untuk mengedit link <span className="font-mono text-violet-300 font-bold">{qrId}</span></>}
        </p>

        {/* PIN dots */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 mb-4 transition-transform duration-300`}
          style={{ animation: isShaking ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : undefined }}
        >
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            const isCurrent = pin.length === index;
            const digitChar = pin[index];
            return (
              <div
                key={index}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 select-none ${isSuccess
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/20'
                  : errorMsg
                    ? 'border-rose-500/70 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/10'
                    : hasDigit
                      ? 'border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/20 scale-102'
                      : isCurrent
                        ? 'border-violet-400/80 bg-slate-800/80 ring-2 ring-violet-500/20'
                        : 'border-slate-700/60 bg-slate-900/60'
                  }`}
              >
                {hasDigit ? (
                  showDigits ? (
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-violet-300">{digitChar}</span>
                  ) : (
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-violet-400 shadow-md shadow-violet-400/50 block" />
                  )
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700 block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error & eye toggle */}
        <div className="flex items-center justify-between w-full px-2 mb-4 h-6">
          <div className="flex-1 min-w-0">
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs truncate">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowDigits(!showDigits)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors shrink-0 ml-2 cursor-pointer"
          >
            {showDigits ? <><EyeOff className="w-3.5 h-3.5" /><span>Sembunyikan</span></> : <><Eye className="w-3.5 h-3.5" /><span>Lihat</span></>}
          </button>
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xs mt-1 mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading || isSuccess || pin.length >= 4}
              onClick={() => handleDigitPress(digit)}
              className="h-12 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-violet-600 active:scale-95 active:text-white border border-slate-700/60 hover:border-slate-600 text-lg sm:text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {digit}
            </button>
          ))}
          <button type="button" disabled={loading || isSuccess || pin.length === 0} onClick={handleClear}
            className="h-12 sm:h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-700/40 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            Clear
          </button>
          <button type="button" disabled={loading || isSuccess || pin.length >= 4} onClick={() => handleDigitPress('0')}
            className="h-12 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-violet-600 active:scale-95 active:text-white border border-slate-700/60 hover:border-slate-600 text-lg sm:text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            0
          </button>
          <button type="button" disabled={loading || isSuccess || pin.length === 0} onClick={handleDelete}
            className="h-12 sm:h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-700/40 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(3px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
          40%, 60% { transform: translate3d(5px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

// ─── Preset definitions ───────────────────────────────────────────────────────
const LINK_PRESETS = [
  { label: 'WhatsApp', icon: FaWhatsapp, url: 'https://wa.me/', color: 'emerald', iconColor: 'text-emerald-400' },
  { label: 'Instagram', icon: FaInstagram, url: 'https://instagram.com/', color: 'pink', iconColor: 'text-pink-400' },
  { label: 'TikTok', icon: FaTiktok, url: 'https://tiktok.com/@', color: 'slate', iconColor: 'text-slate-100' },
  { label: 'YouTube', icon: FaYoutube, url: 'https://youtube.com/', color: 'red', iconColor: 'text-red-500' },
  { label: 'Google Maps', icon: SiGooglemaps, url: 'https://maps.google.com/', color: 'blue', iconColor: 'text-blue-400' },
  { label: 'Shopee', icon: SiShopee, url: 'https://shopee.co.id/', color: 'orange', iconColor: 'text-orange-500' },
  { label: 'Email', icon: FaEnvelope, url: 'mailto:', color: 'amber', iconColor: 'text-amber-400' },
  { label: 'Website', icon: FaGlobe, url: 'https://', color: 'violet', iconColor: 'text-violet-400' },
] as const;

const presetColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40',
  pink: 'bg-pink-500/10 border-pink-500/25 hover:bg-pink-500/20 hover:border-pink-500/40',
  slate: 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600',
  red: 'bg-red-500/10 border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40',
  blue: 'bg-blue-500/10 border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-500/40',
  orange: 'bg-orange-500/10 border-orange-500/25 hover:bg-orange-500/20 hover:border-orange-500/40',
  amber: 'bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40',
  violet: 'bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20 hover:border-violet-500/40',
};

// ─── Main Link Tree Editor ────────────────────────────────────────────────────
export const LinkTreeEditor: React.FC<LinkTreeEditorProps> = ({ id, onGoBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [initialLinks, setInitialLinks] = useState<LinkItem[]>([]);
  const [profileTitle, setProfileTitle] = useState('');
  const [initialProfileTitle, setInitialProfileTitle] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [initialProfileBio, setInitialProfileBio] = useState('');
  const [loadingLinks, setLoadingLinks] = useState(true);

  // Separate save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaveSuccess, setLinksSaveSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Dirty checks
  const isProfileDirty = profileTitle.trim() !== initialProfileTitle.trim() || profileBio.trim() !== initialProfileBio.trim();
  const isLinksDirty = JSON.stringify(links) !== JSON.stringify(initialLinks);

  // PIN update state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinSaveSuccess, setPinSaveSuccess] = useState(false);
  const [pinError, setPinError] = useState('');

  // Verify if QR ID exists in database
  useEffect(() => {
    let isCancelled = false;

    const verifyId = async () => {
      try {
        setIsCheckingId(true);
        const rawId = id.trim();
        const lowerId = rawId.toLowerCase();

        // 1. Check exact ID
        let docRef = doc(db, 'qr_codes', rawId);
        let snapshot = await getDoc(docRef);

        // 2. Fallback lowercase
        if (!snapshot.exists() && rawId !== lowerId) {
          snapshot = await getDoc(doc(db, 'qr_codes', lowerId));
        }

        // 3. Fallback customSlug
        if (!snapshot.exists()) {
          const slugQuery = query(collection(db, 'qr_codes'), where('customSlug', '==', lowerId));
          const slugSnap = await getDocs(slugQuery);
          if (!slugSnap.empty) {
            snapshot = slugSnap.docs[0];
          }
        }

        if (!snapshot.exists()) {
          if (!isCancelled) {
            setIsNotFound(true);
          }
        }
      } catch (err) {
        console.error('Error verifying QR ID:', err);
      } finally {
        if (!isCancelled) {
          setIsCheckingId(false);
        }
      }
    };

    if (id) {
      verifyId();
    } else {
      setIsNotFound(true);
      setIsCheckingId(false);
    }
  }, [id]);

  // Load links from Firestore on auth
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadLinks = async () => {
      setLoadingLinks(true);
      try {
        const docRef = doc(db, 'linktree', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const loadedLinks: LinkItem[] = (data.links && Array.isArray(data.links)) ? data.links : [];
          const loadedTitle = (data.profileTitle || data.title || data.name || '').trim();
          const loadedBio = (data.bio || data.description || '').trim();

          setLinks(loadedLinks);
          setInitialLinks(loadedLinks);
          setProfileTitle(loadedTitle);
          setInitialProfileTitle(loadedTitle);
          setProfileBio(loadedBio);
          setInitialProfileBio(loadedBio);
        } else {
          setLinks([]);
          setInitialLinks([]);
          setProfileTitle('');
          setInitialProfileTitle('');
          setProfileBio('');
          setInitialProfileBio('');
        }
      } catch (err) {
        console.error('Failed to load links:', err);
      } finally {
        setLoadingLinks(false);
      }
    };

    loadLinks();
  }, [isAuthenticated, id]);

  // Add new link (blank)
  const addLink = () => {
    const newId = crypto.randomUUID();
    setLinks((prev) => [
      ...prev,
      { id: newId, title: '', url: '' },
    ]);
    setEditingId(newId);
  };

  // Add link from preset
  const addPresetLink = (preset: typeof LINK_PRESETS[number]) => {
    const newId = crypto.randomUUID();
    setLinks((prev) => [
      ...prev,
      { id: newId, title: preset.label, url: preset.url },
    ]);
    setEditingId(newId);
  };

  // Remove link
  const removeLink = (linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    if (editingId === linkId) setEditingId(null);
  };

  // Reorder link up or down
  const moveLink = (index: number, direction: 'up' | 'down') => {
    setLinks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const item = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = item;
      return next;
    });
  };

  // Update link field
  const updateLink = (linkId: string, field: 'title' | 'url', value: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, [field]: value } : l))
    );
  };

  // Save profile to Firestore
  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileSaveSuccess(false);
    try {
      const docRef = doc(db, 'linktree', id);
      await setDoc(
        docRef,
        {
          profileTitle: profileTitle.trim(),
          bio: profileBio.trim(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      setInitialProfileTitle(profileTitle.trim());
      setInitialProfileBio(profileBio.trim());
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Gagal menyimpan identitas. Coba lagi.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save links to Firestore
  const saveLinks = async () => {
    setSavingLinks(true);
    setLinksSaveSuccess(false);
    try {
      const docRef = doc(db, 'linktree', id);
      await setDoc(
        docRef,
        {
          links,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      setInitialLinks(links);
      setLinksSaveSuccess(true);
      setTimeout(() => setLinksSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save links:', err);
      alert('Gagal menyimpan link. Coba lagi.');
    } finally {
      setSavingLinks(false);
    }
  };

  // Update PIN
  const handleUpdatePin = async () => {
    const cleaned = newPin.trim();
    if (cleaned.length !== 4 || !/^\d{4}$/.test(cleaned)) {
      setPinError('PIN harus 4 digit angka.');
      return;
    }
    setPinSaving(true);
    setPinError('');
    try {
      const pinRef = doc(db, 'setting', 'pin');
      await setDoc(pinRef, { [id]: cleaned }, { merge: true });
      setPinSaveSuccess(true);
      setTimeout(() => {
        setPinSaveSuccess(false);
        setShowPinModal(false);
        setNewPin('');
      }, 1500);
    } catch (err) {
      console.error('Failed to update PIN:', err);
      setPinError('Gagal menyimpan PIN. Periksa koneksi.');
    } finally {
      setPinSaving(false);
    }
  };



  // ─── ID Verification Gates ──────────────────────────────────────────────────
  if (isCheckingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Memeriksa ID...</p>
        <p className="text-xs text-slate-500 font-mono mt-1">{id}</p>
      </div>
    );
  }

  if (isNotFound) {
    return <NotFound id={id} onGoHome={onGoBack} />;
  }

  // ─── PIN Lock Gate ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <EditorPinLock qrId={id} onSuccess={() => setIsAuthenticated(true)} />;
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loadingLinks) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-1">Memuat Link Editor...</h2>
        <p className="text-xs text-slate-400 font-mono">ID: {id}</p>
      </div>
    );
  }

  // ─── Editor UI ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(139,92,246,0.14),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-violet-300 bg-slate-800/40 border border-slate-700/60 hover:bg-slate-800 transition-all"
              title="Lihat tampilan publik link tree ini"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pratinjau</span>
            </a>
            <button
              onClick={() => { setShowPinModal(true); setPinSaveSuccess(false); setPinError(''); setNewPin(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ubah PIN</span>
            </button>
          </div>
        </div>

        {/* Title area — compact */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-lg shadow-violet-500/10">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Link Editor</h1>
            <p className="text-xs text-slate-500">
              ID: <span className="font-mono text-violet-300/80 font-semibold">{id}</span>
              {links.length > 0 && <span className="ml-2 text-slate-600">&bull; {links.length} link</span>}
            </p>
          </div>
        </div>

        {/* ─── Profile / Title Configuration ─────────────────────────────── */}
        <div className="bg-slate-900/70 backdrop-blur border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Identitas & Judul Halaman
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama / Judul Tampilan
              </label>
              <input
                type="text"
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                placeholder={`Contoh: Brand Saya`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Deskripsi / Bio Singkat <span className="text-slate-500 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Contoh: Official Link, Jam Buka, & Social Media"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Conditional Save Button for Identity */}
          {(isProfileDirty || profileSaveSuccess) && (
            <div className="pt-3 mt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                  profileSaveSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/25 active:scale-[0.99]'
                }`}
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan Identitas...</span>
                  </>
                ) : profileSaveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Identitas Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Identitas</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ─── Link List Section ─────────────────────────────────────────── */}
        {links.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Daftar Link ({links.length})
              </span>
              <span className="text-[10px] text-slate-500">Klik kartu untuk edit</span>
            </div>

            <div className="space-y-2">
              {links.map((link, index) => {
                const isEditing = editingId === link.id;
                const platform = getPlatformInfo(link.url, link.title);
                const PlatformIcon = platform.icon;

                // ── Editing mode ──
                if (isEditing) {
                  return (
                    <div
                      key={link.id}
                      className="bg-slate-900/90 backdrop-blur border border-violet-500/40 rounded-2xl p-4 shadow-xl shadow-violet-500/5 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${platform.badgeBg}`}>
                            <PlatformIcon className={`w-3.5 h-3.5 ${platform.color}`} />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                            Edit Link #{index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              await saveLinks();
                              setEditingId(null);
                            }}
                            disabled={savingLinks}
                            className="px-3 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                          >
                            {savingLinks ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...</>
                            ) : (
                              <><Save className="w-3 h-3" /> Simpan</>
                            )}
                          </button>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Hapus link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">Judul Tombol</label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                            placeholder="Contoh: WhatsApp Kami, Instagram, dll"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 font-medium mb-1">URL Tujuan</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950/90 border border-slate-700/70 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono text-xs"
                            />
                            {link.url && (
                              <a
                                href={link.url.startsWith('http') || link.url.startsWith('mailto:') ? link.url : `https://${link.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-400 transition-colors"
                                title="Uji buka link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ── Preview mode (card) ──
                return (
                  <div
                    key={link.id}
                    onClick={() => setEditingId(link.id)}
                    className="group flex items-center gap-3 bg-slate-900/60 backdrop-blur border border-slate-800/80 rounded-2xl px-3.5 py-3 cursor-pointer hover:border-slate-700 hover:bg-slate-900/90 transition-all active:scale-[0.99]"
                  >
                    {/* Reorder buttons */}
                    {links.length > 1 && (
                      <div className="flex flex-col -space-y-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-slate-600 hover:text-slate-200 disabled:opacity-20 disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Pindah ke atas"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === links.length - 1}
                          className="p-0.5 text-slate-600 hover:text-slate-200 disabled:opacity-20 disabled:hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          title="Pindah ke bawah"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* React-Icons avatar */}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${platform.badgeBg}`}>
                      <PlatformIcon className={`w-4.5 h-4.5 ${platform.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {link.title || <span className="text-slate-500 italic font-normal">Tanpa judul</span>}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                        {link.url || <span className="text-slate-600 italic">Belum ada URL</span>}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {link.url && (
                        <a
                          href={link.url.startsWith('http') || link.url.startsWith('mailto:') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                          title="Buka link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => setEditingId(link.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-violet-300 hover:bg-violet-500/10 transition-all cursor-pointer"
                        title="Edit link"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeLink(link.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Hapus link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Add Link Section ──────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tambah Link</span>
            <div className="flex-1 h-px bg-slate-800/80" />
          </div>

          {/* Preset grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {LINK_PRESETS.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={preset.label}
                  onClick={() => addPresetLink(preset)}
                  className={`group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${presetColorMap[preset.color]}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComponent className={`w-4 h-4 ${preset.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 leading-tight">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom link button */}
          <button
            onClick={addLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700/80 hover:border-violet-500/40 text-slate-500 hover:text-violet-300 transition-all cursor-pointer bg-slate-900/20 hover:bg-violet-500/5"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">Link Custom</span>
          </button>
        </div>

        {/* ─── Empty hint ────────────────────────────────────────────────── */}
        {links.length === 0 && (
          <div className="text-center py-6 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900/60 border border-slate-800 mx-auto mb-3 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-slate-700" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Belum ada link</p>
            <p className="text-xs text-slate-600 mt-1">Pilih preset di atas atau tambah link custom</p>
          </div>
        )}


      </div>

      {/* ─── PIN Update Modal ─────────────────────────────────────────────── */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            {/* Close */}
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ubah PIN</h3>
                <p className="text-xs text-slate-400">
                  PIN baru untuk ID: <span className="font-mono text-amber-300 font-bold">{id}</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">PIN Baru (4 digit):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setPinError('');
                  }}
                  placeholder="Contoh: 1234"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white text-center tracking-[0.5em] font-mono font-bold placeholder-slate-500 placeholder:tracking-normal focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
                {pinError && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {pinError}
                  </p>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                PIN akan disimpan di <span className="font-mono text-slate-400">setting &gt; pin &gt; {id}</span>.
                PIN ini khusus untuk ID ini saja.
              </p>

              <button
                onClick={handleUpdatePin}
                disabled={pinSaving || pinSaveSuccess}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${pinSaveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25'
                  }`}
              >
                {pinSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : pinSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>PIN Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Simpan PIN Baru</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

