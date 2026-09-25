import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { QRCodeItem } from '../types';

const QR_COLLECTION = 'qr_codes';

/**
 * Real-time subscription to all QR codes sorted naturally by ID
 */
export const subscribeQrCodes = (
  onData: (items: QRCodeItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe => {
  const colRef = collection(db, QR_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: QRCodeItem[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as QRCodeItem);
      });
      list.sort((a, b) => {
        const nameA = a.customSlug || a.label || a.id;
        const nameB = b.customSlug || b.label || b.id;
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });
      onData(list);
    },
    (err) => {
      console.error('Firestore onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Fetch a single QR code by ID
 */
export const getQrCodeById = async (id: string): Promise<QRCodeItem | null> => {
  const docRef = doc(db, QR_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as QRCodeItem;
};

/**
 * Update target URL of a QR code
 */
export const updateQrTargetUrl = async (id: string, targetUrl: string): Promise<void> => {
  const docRef = doc(db, QR_COLLECTION, id);
  await updateDoc(docRef, {
    targetUrl: targetUrl.trim(),
    updatedAt: Date.now(),
  });
};

/**
 * Record a single scan event with scanCount increment
 */
export const recordQrScan = async (id: string): Promise<void> => {
  const docRef = doc(db, QR_COLLECTION, id);
  await updateDoc(docRef, {
    scanCount: increment(1),
    lastScannedAt: Date.now(),
  });
};

/**
 * Delete a single QR Code
 */
export const deleteQrCode = async (id: string): Promise<void> => {
  const docRef = doc(db, QR_COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Batch delete multiple QR Codes
 */
export const deleteBatchQrCodes = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;
  const batchSize = 400;
  let batch = writeBatch(db);
  let countInBatch = 0;

  for (const id of ids) {
    const docRef = doc(db, QR_COLLECTION, id);
    batch.delete(docRef);
    countInBatch++;

    if (countInBatch >= batchSize) {
      await batch.commit();
      batch = writeBatch(db);
      countInBatch = 0;
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
  }
};

import { generateRandom6Char } from '../utils/qrHelper';

/**
 * Create a custom QR code / slug with 6-character random alphanumeric link key
 */
export const createCustomSlugItem = async (
  customSlug: string,
  targetUrl: string = '',
  explicitRandomId?: string
): Promise<{ id: string; customSlug: string }> => {
  const cleanSlug = customSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanSlug) {
    throw new Error('Custom slug tidak boleh kosong.');
  }

  let finalRandomId = explicitRandomId ? explicitRandomId.trim() : generateRandom6Char();
  
  // Ensure the 6-character ID is unique in Firestore
  let attempts = 0;
  while (attempts < 10) {
    const docRef = doc(db, QR_COLLECTION, finalRandomId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      break;
    }
    finalRandomId = generateRandom6Char();
    attempts++;
  }

  const docRef = doc(db, QR_COLLECTION, finalRandomId);
  const newItem: QRCodeItem = {
    id: finalRandomId,
    customSlug: cleanSlug,
    label: cleanSlug,
    targetUrl: targetUrl.trim(),
    createdAt: Date.now(),
    scanCount: 0,
    isCustomSlug: true,
  };

  await setDoc(docRef, newItem);
  return { id: finalRandomId, customSlug: cleanSlug };
};

/**
 * Legacy compatibility helper
 */
export const createCustomSlug = async (
  id: string,
  targetUrl: string = '',
  label?: string
): Promise<void> => {
  await createCustomSlugItem(id, targetUrl);
};

export interface BulkGenerateParams {
  prefix: string;
  startNum: number;
  count: number;
  padLength: number;
  initialUrl?: string;
}

/**
 * Bulk generate sequential QR codes with 6-character random alphanumeric links
 */
export const bulkGenerateQrCodes = async (params: BulkGenerateParams): Promise<number> => {
  const batchSize = 400;
  let batch = writeBatch(db);
  let countInBatch = 0;
  let totalCreated = 0;
  const usedIdsInBatch = new Set<string>();

  for (let i = 0; i < params.count; i++) {
    const num = params.startNum + i;
    const slug = `${params.prefix}${String(num).padStart(params.padLength, '0')}`;
    
    // Generate unique 6-character random alphanumeric string for the link key
    let randomId = generateRandom6Char();
    while (usedIdsInBatch.has(randomId)) {
      randomId = generateRandom6Char();
    }
    usedIdsInBatch.add(randomId);

    const docRef = doc(db, QR_COLLECTION, randomId);

    const newItem: QRCodeItem = {
      id: randomId,
      customSlug: slug,
      label: slug,
      targetUrl: params.initialUrl || '',
      createdAt: Date.now(),
      scanCount: 0,
      isCustomSlug: true,
    };

    batch.set(docRef, newItem, { merge: true });
    countInBatch++;
    totalCreated++;

    if (countInBatch >= batchSize) {
      await batch.commit();
      batch = writeBatch(db);
      countInBatch = 0;
    }
  }

  if (countInBatch > 0) {
    await batch.commit();
  }

  return totalCreated;
};
