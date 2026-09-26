import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface NotFoundProps {
  id?: string;
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ id, message }) => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-sm w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {id && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800/80 text-rose-400 border border-slate-700/80 mb-3">
            <span>404</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-300">/{id}</span>
          </div>
        )}

        <h1 className="text-xl font-bold text-white tracking-tight mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          {message || (
            <>
              QR / ID <span className="font-mono text-slate-200 font-semibold">{id ? `/${id}` : ''}</span> tidak terdaftar di database.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
