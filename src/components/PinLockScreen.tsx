import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, AlertCircle, Loader2, Eye, EyeOff, Delete, KeyRound, Sparkles } from 'lucide-react';
import { verifyDashboardPin, setDashboardAuthenticated } from '../services/pinService';

interface PinLockScreenProps {
  onSuccess: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showDigits, setShowDigits] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on mount
  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  // Handle digit inputs
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
      const result = await verifyDashboardPin(pinToTest);
      if (result.valid) {
        setIsSuccess(true);
        setDashboardAuthenticated(rememberMe);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setIsShaking(true);
        setErrorMsg(result.message || 'PIN yang dimasukkan salah.');
        setTimeout(() => {
          setIsShaking(false);
          setPin('');
          hiddenInputRef.current?.focus();
        }, 600);
      }
    } catch {
      setIsShaking(true);
      setErrorMsg('Gagal memverifikasi PIN. Periksa koneksi internet.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
        hiddenInputRef.current?.focus();
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard events listener
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
  }, [pin, loading, isSuccess, rememberMe]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden input to trigger virtual keyboard on mobile tap if needed */}
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
          if (val.length === 4) {
            submitPin(val);
          }
        }}
        className="opacity-0 absolute -top-96 left-0 w-1 h-1 pointer-events-none"
        aria-hidden="true"
        autoFocus
      />

      <div
        onClick={() => hiddenInputRef.current?.focus()}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative z-10 flex flex-col items-center"
      >
        {/* Top Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Akses Keamanan Dashboard</span>
        </div>

        {/* Shield / Lock Icon */}
        <div className="relative mb-5">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
              isSuccess
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/20 scale-105'
                : errorMsg
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/20'
                : 'bg-gradient-to-tr from-indigo-600/30 via-indigo-500/20 to-violet-600/30 border border-indigo-500/30 text-indigo-400 shadow-indigo-500/15'
            }`}
          >
            {loading ? (
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-indigo-400" />
            ) : isSuccess ? (
              <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
            )}
          </div>
        </div>

        {/* Title and Instruction */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center">
          {isSuccess ? 'Akses Diterima!' : 'Masukkan 4 Digit PIN'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 text-center mt-1.5 mb-6 max-w-xs">
          {isSuccess
            ? 'Membuka dashboard QR & NFC Hub...'
            : 'PIN tersimpan di database setting > pin > dashboard'}
        </p>

        {/* 4 PIN Digit Indicator Boxes with Shake */}
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 mb-4 transition-transform duration-300 ${
            isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
          style={{
            animation: isShaking ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' : undefined,
          }}
        >
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            const isCurrent = pin.length === index;
            const digitChar = pin[index];

            return (
              <div
                key={index}
                className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 select-none ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-500/20'
                    : errorMsg
                    ? 'border-rose-500/70 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/10'
                    : hasDigit
                    ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/20 scale-102'
                    : isCurrent
                    ? 'border-indigo-400/80 bg-slate-800/80 ring-2 ring-indigo-500/20'
                    : 'border-slate-700/60 bg-slate-900/60'
                }`}
              >
                {hasDigit ? (
                  showDigits ? (
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-300">
                      {digitChar}
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-indigo-400 shadow-md shadow-indigo-400/50 block animate-scale-in" />
                  )
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700 block" />
                )}
              </div>
            );
          })}
        </div>

        {/* Eye Toggle & Error Message */}
        <div className="flex items-center justify-between w-full px-2 mb-4 h-6">
          <div className="flex-1 min-w-0">
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs animate-fade-in truncate">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{errorMsg}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDigits(!showDigits)}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors shrink-0 ml-2 cursor-pointer"
            title={showDigits ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
          >
            {showDigits ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Sembunyikan</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xs mt-1 mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={loading || isSuccess || pin.length >= 4}
              onClick={() => handleDigitPress(digit)}
              className="h-12 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-indigo-600 active:scale-95 active:text-white border border-slate-700/60 hover:border-slate-600 text-lg sm:text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {digit}
            </button>
          ))}

          {/* Clear Key */}
          <button
            type="button"
            disabled={loading || isSuccess || pin.length === 0}
            onClick={handleClear}
            className="h-12 sm:h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-700/40 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear
          </button>

          {/* Zero Key */}
          <button
            type="button"
            disabled={loading || isSuccess || pin.length >= 4}
            onClick={() => handleDigitPress('0')}
            className="h-12 sm:h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-750 active:bg-indigo-600 active:scale-95 active:text-white border border-slate-700/60 hover:border-slate-600 text-lg sm:text-xl font-bold text-slate-100 transition-all flex items-center justify-center shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            type="button"
            disabled={loading || isSuccess || pin.length === 0}
            onClick={handleDelete}
            className="h-12 sm:h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 active:scale-95 border border-slate-700/40 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Hapus Digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Remember on this device checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500/40 focus:ring-offset-0 cursor-pointer"
          />
          <span>Ingat login di browser ini</span>
        </label>
      </div>

      {/* Footer hint */}
      <p className="text-[11px] text-slate-500 mt-6 text-center flex items-center gap-1.5 z-10">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Gunakan keyboard fisik atau keypad layar untuk mengetik PIN</span>
      </p>

      {/* Keyframe animation inline style for shake */}
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
