import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AUTH_STORAGE_KEY = 'qr_hub_dashboard_pin_auth';
const REMEMBER_STORAGE_KEY = 'qr_hub_dashboard_pin_remember';

/**
 * Check if the user is currently authenticated via PIN in this session or stored preference
 */
export const isDashboardAuthenticated = (): boolean => {
  try {
    const sessionAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (sessionAuth === 'true') return true;

    const localAuth = localStorage.getItem(REMEMBER_STORAGE_KEY);
    if (localAuth === 'true') return true;

    return false;
  } catch {
    return false;
  }
};

/**
 * Set the authentication state after successful PIN verification
 */
export const setDashboardAuthenticated = (remember: boolean = false): void => {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (remember) {
      localStorage.setItem(REMEMBER_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Storage access warning:', err);
  }
};

/**
 * Clear the authentication state (Lock / Logout)
 */
export const clearDashboardAuthentication = (): void => {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_STORAGE_KEY);
  } catch (err) {
    console.warn('Storage access warning:', err);
  }
};

export interface PinVerifyResult {
  valid: boolean;
  message?: string;
}

/**
 * Verify 4-digit PIN against Firestore database
 * Primary path: collection('setting') -> doc('pin') -> field: dashboard
 */
export const verifyDashboardPin = async (inputPin: string): Promise<PinVerifyResult> => {
  const cleanInput = inputPin.trim();
  if (cleanInput.length !== 4) {
    return { valid: false, message: 'PIN harus 4 digit angka.' };
  }

  try {
    // 1. Check collection 'setting', doc 'pin'
    const settingPinRef = doc(db, 'setting', 'pin');
    const settingPinSnap = await getDoc(settingPinRef);

    if (settingPinSnap.exists()) {
      const data = settingPinSnap.data();
      const expectedPin = data?.dashboard ?? data?.pin;

      if (expectedPin !== undefined && expectedPin !== null) {
        const expectedPinStr = String(expectedPin).trim();
        if (cleanInput === expectedPinStr) {
          return { valid: true };
        } else {
          return { valid: false, message: 'PIN yang dimasukkan salah.' };
        }
      }
    }

    // 2. Fallback check: collection 'settings', doc 'pin'
    const settingsPinRef = doc(db, 'settings', 'pin');
    const settingsPinSnap = await getDoc(settingsPinRef);

    if (settingsPinSnap.exists()) {
      const data = settingsPinSnap.data();
      const expectedPin = data?.dashboard ?? data?.pin;

      if (expectedPin !== undefined && expectedPin !== null) {
        const expectedPinStr = String(expectedPin).trim();
        if (cleanInput === expectedPinStr) {
          return { valid: true };
        } else {
          return { valid: false, message: 'PIN yang dimasukkan salah.' };
        }
      }
    }

    // 3. Fallback check: collection 'setting', doc 'dashboard'
    const settingDashRef = doc(db, 'setting', 'dashboard');
    const settingDashSnap = await getDoc(settingDashRef);

    if (settingDashSnap.exists()) {
      const data = settingDashSnap.data();
      const expectedPin = data?.pin ?? data?.dashboard;

      if (expectedPin !== undefined && expectedPin !== null) {
        const expectedPinStr = String(expectedPin).trim();
        if (cleanInput === expectedPinStr) {
          return { valid: true };
        } else {
          return { valid: false, message: 'PIN yang dimasukkan salah.' };
        }
      }
    }

    return {
      valid: false,
      message: 'PIN belum dikonfigurasi di database (setting > pin > dashboard).',
    };
  } catch (err: unknown) {
    console.error('Firestore PIN verification error:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'Gagal menghubungi database Firestore.';
    return {
      valid: false,
      message: `Error verifikasi: ${errorMessage}`,
    };
  }
};
