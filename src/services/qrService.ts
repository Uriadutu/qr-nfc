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
      list.sort((a, b) =>
        a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
      );
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

/**
 * Create a custom QR code / slug
 */
export const createCustomSlug = async (
  id: string,
  targetUrl: string = '',
  label?: string
): Promise<void> => {
  const docRef = doc(db, QR_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    throw new Error(`ID atau Slug "${id}" sudah digunakan! Silakan gunakan slug lain.`);
  }

  const newItem: QRCodeItem = {
    id,
    targetUrl: targetUrl.trim(),
    createdAt: Date.now(),
    scanCount: 0,
    isCustomSlug: true,
    ...(label ? { label: label.trim() } : {}),
  };

  await setDoc(docRef, newItem);
};

export interface BulkGenerateParams {
  prefix: string;
  startNum: number;
  count: number;
  padLength: number;
  initialUrl?: string;
}

/**
 * Bulk generate sequential QR codes
 */
export const bulkGenerateQrCodes = async (params: BulkGenerateParams): Promise<number> => {
  const batchSize = 400;
  let batch = writeBatch(db);
  let countInBatch = 0;
  let totalCreated = 0;

  for (let i = 0; i < params.count; i++) {
    const num = params.startNum + i;
    const id = `${params.prefix}${String(num).padStart(params.padLength, '0')}`;
    const docRef = doc(db, QR_COLLECTION, id);

    const newItem: QRCodeItem = {
      id,
      targetUrl: params.initialUrl || '',
      createdAt: Date.now(),
      scanCount: 0,
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
