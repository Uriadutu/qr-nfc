import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeItem } from '../types';
import {
  QrCode,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Settings,
  Link2,
  Pencil,
} from 'lucide-react';
import { getPlatformInfo } from './LinkIcon';
import { NotFound } from './NotFound';

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface RedirectHandlerProps {
  id: string;
  onGoHome?: () => void;
  isAdmin?: boolean;
}

export const RedirectHandler: React.FC<RedirectHandlerProps> = ({ id, onGoHome, isAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'linktree' | 'empty' | 'not_found' | 'error'>('loading');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profileTitle, setProfileTitle] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Guard flag to prevent React 19 StrictMode double execution incrementing counter twice
  const hasIncrementedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const checkRedirect = async () => {
      try {
        setLoading(true);
        const rawId = id.trim();
        const lowerId = rawId.toLowerCase();

        // 1. Cek langsung dengan ID persis (case-sensitive untuk 6 karakter random e.g. ui7eG8)
        let docRef = doc(db, 'qr_codes', rawId);
        let snapshot = await getDoc(docRef);

        // 2. Fallback jika ID disimpan dengan huruf kecil
        if (!snapshot.exists() && rawId !== lowerId) {
          const lowerRef = doc(db, 'qr_codes', lowerId);
          const lowerSnap = await getDoc(lowerRef);
          if (lowerSnap.exists()) {
            docRef = lowerRef;
            snapshot = lowerSnap;
          }
        }

        // 3. Fallback: periksa apakah ini customSlug (misal user mengakses /menu atau /qr001)
        if (!snapshot.exists()) {
          const slugQuery = query(collection(db, 'qr_codes'), where('customSlug', '==', lowerId));
          const slugSnap = await getDocs(slugQuery);
          if (!slugSnap.empty) {
            const matchedDoc = slugSnap.docs[0];
            docRef = matchedDoc.ref;
            snapshot = matchedDoc;
          }
        }

        // JIKA ID TIDAK ADA DI DATABASE -> NOT FOUND (404)
        if (!snapshot.exists()) {
          if (!isCancelled) {
            setStatus('not_found');
            setLoading(false);
          }
          return;
        }

        const data = snapshot.data() as QRCodeItem;

        // Fetch linktree data
        const linktreeRef = doc(db, 'linktree', rawId);
        let linktreeSnap = await getDoc(linktreeRef);

        // Fallback lowercase
        if (!linktreeSnap.exists() && rawId !== lowerId) {
          linktreeSnap = await getDoc(doc(db, 'linktree', lowerId));
        }

        const linktreeLinks: LinkItem[] = [];
        let fetchedTitle = '';
        let fetchedBio = '';

        if (linktreeSnap.exists()) {
          const ltData = linktreeSnap.data();
          if (ltData.links && Array.isArray(ltData.links)) {
            linktreeLinks.push(...ltData.links.filter((l: LinkItem) => l.title || l.url));
          }
          if (ltData.profileTitle || ltData.title || ltData.name) {
            fetchedTitle = (ltData.profileTitle || ltData.title || ltData.name || '').trim();
          }
          if (ltData.bio || ltData.description) {
            fetchedBio = (ltData.bio || ltData.description || '').trim();
          }
        }

        // If linktree has links → show link tree
        if (linktreeLinks.length > 0) {
          if (!isCancelled) {
            setLinks(linktreeLinks);
            setProfileTitle(fetchedTitle);
            setProfileBio(fetchedBio);
            if (fetchedTitle) {
              document.title = `${fetchedTitle} | Link Tree`;
            }
            setStatus('linktree');
            setLoading(false);

            // Record scan
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
          }
          return;
        }

        // If targetUrl exists → redirect
        if (data.targetUrl && data.targetUrl.trim() !== '') {
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
          window.location.replace(target);
          return;
        }

        // No links and no targetUrl → empty state
        if (!isCancelled) {
          setStatus('empty');
          setLoading(false);
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

  const navigateToEditor = () => {
    window.location.href = `/app2/${id}`;
  };

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Memuat...</p>
        <p className="text-xs text-slate-500 font-mono mt-1">{id}</p>
      </div>
    );
  }

  // ─── Redirecting State ──────────────────────────────────────────────────────
  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-300">Mengalihkan...</p>
      </div>
    );
  }

  // ─── Link Tree Display (links active) ──────────────────────────────────────
  if (status === 'linktree') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)] pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

        {/* Settings button — top right */}
        <button
          onClick={navigateToEditor}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-lg border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer active:scale-90"
          title="Edit Link Tree"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        <div className="relative z-10 w-full max-w-md mx-auto px-5 pt-14 pb-10">
          {/* Profile / ID section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {profileTitle || id}
            </h1>
            {profileBio ? (
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                {profileBio}
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {id}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            {links.map((link) => {
              let href = link.url?.trim() || '#';
              if (href !== '#' && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
                href = `https://${href}`;
              }

              const platform = getPlatformInfo(link.url, link.title);
              const PlatformIcon = platform.icon;

              return (
                <a
                  key={link.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3.5 w-full px-4 py-3.5 rounded-2xl bg-slate-900/70 backdrop-blur border border-slate-800/80 ${platform.hoverBorder} hover:bg-slate-800/60 transition-all duration-200 active:scale-[0.98] cursor-pointer`}
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${platform.badgeBg}`}>
                    <PlatformIcon className={`w-5 h-5 ${platform.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-violet-200 transition-colors">
                      {link.title || 'Untitled'}
                    </p>
                    {link.url && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                        {link.url}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors shrink-0" />
                </a>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // ─── Empty State (no links, no targetUrl) ──────────────────────────────────
  if (status === 'empty') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-xs">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 mx-auto mb-5 flex items-center justify-center">
            <Link2 className="w-7 h-7 text-slate-600" />
          </div>

          <p className="text-sm text-slate-400 mb-1 font-medium">Belum ada link</p>
          <p className="text-xs text-slate-600 mb-6">
            QR Code <span className="font-mono text-slate-400">{id}</span> belum memiliki link tree.
          </p>

          <button
            onClick={navigateToEditor}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/25 cursor-pointer active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Link Tree</span>
          </button>
        </div>

      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-sm w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-4 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h1 className="text-base font-bold text-white mb-1.5">Gagal Memuat</h1>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Tidak dapat membaca data dari Firestore. Periksa koneksi internet atau coba muat ulang.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Muat Ulang
            </button>
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-slate-700"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 404 Not Found ──────────────────────────────────────────────────────────
  return <NotFound id={id} onGoHome={onGoHome} />;
};
