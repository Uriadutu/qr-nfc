import { useState, useEffect, useMemo, useCallback } from 'react';
import { QRCodeItem } from '../types';
import { subscribeQrCodes } from '../services/qrService';
import { generateQrDataUrl } from '../utils/qrHelper';

export interface FirestoreErrorDetail {
  code: string;
  message: string;
  isPermissionDenied: boolean;
  isNotFound: boolean;
}

export function useQrCodes(baseUrl: string) {
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreErrorDetail | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  // Real-time Firestore Subscription
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeQrCodes(
      (data) => {
        setItems(data);
        setLoading(false);
        setError(null);
      },
      (err: any) => {
        const errorMsg = err?.message || String(err);
        const errorCode = err?.code || '';
        const isPermission =
          errorCode === 'permission-denied' ||
          errorMsg.toLowerCase().includes('permission') ||
          errorMsg.toLowerCase().includes('insufficient');
        const isNotFound =
          errorCode === 'not-found' ||
          errorMsg.toLowerCase().includes('not found') ||
          errorMsg.toLowerCase().includes('database');

        setError({
          code: errorCode,
          message: errorMsg,
          isPermissionDenied: isPermission,
          isNotFound,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [reloadKey]);

  // Generate QR previews incrementally
  useEffect(() => {
    let isCancelled = false;

    const generateMissingPreviews = async () => {
      const missingItems = items.filter((item) => !previews[item.id]);
      if (missingItems.length === 0) return;

      const newPreviews: Record<string, string> = {};
      for (const item of missingItems) {
        if (isCancelled) return;
        const target = `${baseUrl}/${item.id}`;
        try {
          newPreviews[item.id] = await generateQrDataUrl(target, { width: 220, margin: 1 });
        } catch (err) {
          console.error('Failed to preview QR for', item.id, err);
        }
      }

      if (!isCancelled && Object.keys(newPreviews).length > 0) {
        setPreviews((prev) => ({ ...prev, ...newPreviews }));
      }
    };

    if (items.length > 0) {
      generateMissingPreviews();
    }

    return () => {
      isCancelled = true;
    };
  }, [items, baseUrl, previews]);

  const removePreview = (id: string) => {
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeBatchPreviews = (ids: string[]) => {
    setPreviews((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  };

  // Compute statistics
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.targetUrl && i.targetUrl.trim() !== '').length;
    const empty = total - active;
    const totalScans = items.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);
    return { total, active, empty, totalScans };
  }, [items]);

  return {
    items,
    loading,
    error,
    retry,
    previews,
    stats,
    removePreview,
    removeBatchPreviews,
  };
}
