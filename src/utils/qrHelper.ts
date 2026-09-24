import QRCode from 'qrcode';
import JSZip from 'jszip';
import { QRCodeItem } from '../types';

/**
 * Generate a PNG data URL for a given target QR URL
 */
export async function generateQrDataUrl(
  text: string, 
  options?: { 
    width?: number; 
    margin?: number; 
    darkColor?: string; 
    lightColor?: string;
  }
): Promise<string> {
  return await QRCode.toDataURL(text, {
    width: options?.width || 600,
    margin: options?.margin ?? 2,
    color: {
      dark: options?.darkColor || '#000000',
      light: options?.lightColor || '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate high-res print-ready canvas with label & URL footer
 */
export async function generatePrintableQrCard(
  qrItem: QRCodeItem,
  fullPublicUrl: string,
  appName = 'QR Hub'
): Promise<string> {
  const qrDataUrl = await generateQrDataUrl(fullPublicUrl, { width: 800, margin: 2 });
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const width = 1000;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      // Background Card
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(0, 0, width, height, 32);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 6;
      ctx.roundRect(3, 3, width - 6, height - 6, 29);
      ctx.stroke();

      // Header Banner
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(0, 0, width, 140, [32, 32, 0, 0]);
      ctx.fill();

      // App title
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(appName.toUpperCase(), width / 2, 80);

      // QR Image in center
      const qrSize = 750;
      const qrX = (width - qrSize) / 2;
      const qrY = 190;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // ID Tag Badge
      ctx.fillStyle = '#e0e7ff';
      ctx.roundRect((width - 320) / 2, 970, 320, 60, 30);
      ctx.fill();

      ctx.fillStyle = '#3730a3';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`ID: ${qrItem.id}`, width / 2, 1012);

      // Scan instruction footer
      ctx.fillStyle = '#64748b';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Scan QR ini dengan kamera ponsel Anda', width / 2, 1070);

      // Public URL subtext
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 18px "JetBrains Mono", monospace';
      const truncatedUrl = fullPublicUrl.length > 55 ? fullPublicUrl.substring(0, 52) + '...' : fullPublicUrl;
      ctx.fillText(truncatedUrl, width / 2, 1115);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = qrDataUrl;
  });
}

/**
 * Download a single image by data URL
 */
export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Bulk download selected QR codes as a ZIP file
 */
export async function downloadBulkAsZip(
  items: QRCodeItem[],
  baseUrl: string,
  mode: 'simple' | 'card' = 'card',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('qr-codes');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/${item.id}`;
    let dataUrl: string;

    if (mode === 'card') {
      dataUrl = await generatePrintableQrCard(item, fullUrl);
    } else {
      dataUrl = await generateQrDataUrl(fullUrl, { width: 800, margin: 2 });
    }

    // Extract base64 part
    const base64Data = dataUrl.split(',')[1];
    folder?.file(`${item.id}.png`, base64Data, { base64: true });

    if (onProgress) {
      onProgress(i + 1, items.length);
    }
  }

  // Add a CSV summary in the zip
  const csvHeader = 'ID,Full_Redirect_URL,Target_URL,Status\n';
  const csvRows = items
    .map(
      (item) =>
        `"${item.id}","${baseUrl.replace(/\/$/, '')}/${item.id}","${item.targetUrl || ''}","${
          item.targetUrl ? 'AKTIF' : 'KOSONG'
        }"`
    )
    .join('\n');
  folder?.file('daftar_qr.csv', csvHeader + csvRows);

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  triggerDownload(downloadUrl, `qr-codes-bundle-${Date.now()}.zip`);
  URL.revokeObjectURL(downloadUrl);
}
