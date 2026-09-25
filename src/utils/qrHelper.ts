import QRCode from 'qrcode';
import JSZip from 'jszip';
import { QRCodeItem } from '../types';
import nfcTemplateUrl from '../img/nfc.png';

/**
 * ============================================================================
 * Generate random 6-character alphanumeric string
 * ============================================================================
 *
 * Contoh:
 * "u8iA0Y"
 * "k9L2xP"
 * "7nB3qZ"
 */
export function generateRandom6Char(): string {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let result = '';

  const cryptoObj =
    typeof window !== 'undefined' ? window.crypto : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const values = new Uint8Array(6);

    cryptoObj.getRandomValues(values);

    for (let i = 0; i < 6; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

/**
 * ============================================================================
 * Generate QR Code sebagai PNG Data URL
 * ============================================================================
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
 * ============================================================================
 * KONFIGURASI QR CODE PADA TEMPLATE NFC
 * ============================================================================
 *
 * QR akan otomatis ditempatkan di POJOK KANAN BAWAH gambar nfc.png
 *
 * Tidak perlu menentukan x dan y secara manual.
 */
export const NFC_QR_CONFIG = {
  /**
   * Posisi horizontal.
   *
   * null = otomatis ke kanan
   */
  x: null,

  /**
   * Posisi vertikal.
   *
   * null = otomatis ke bawah
   */
  y: null,

  /**
   * Ukuran QR Code dalam pixel.
   *
   * Contoh:
   * 500
   * 700
   * 1000
   */
  size: 1400,

  /**
   * Jarak QR dari sisi kanan gambar.
   *
   * Semakin kecil = semakin dekat ke kanan.
   */
  paddingRight: 400 * 2 + 60,

  /**
   * Jarak QR dari sisi bawah gambar.
   *
   * Semakin kecil = semakin dekat ke bawah.
   */
  paddingBottom: 300 * 5 + 200,

  /**
   * Margin internal QR Code.
   *
   * 0 = tidak ada margin tambahan.
   */
  margin: 0,

  /**
   * Warna titik QR.
   */
  darkColor: '#000000',

  /**
   * Background QR transparan.
   *
   * '#00000000' = transparan
   */
  lightColor: '#00000000',
};

/**
 * ============================================================================
 * Generate kartu/gambar QR dengan template nfc.png
 * ============================================================================
 *
 * Proses:
 *
 * 1. Generate QR Code
 * 2. Load template nfc.png
 * 3. Buat canvas dengan ukuran template
 * 4. Gambar template
 * 5. Letakkan QR di kanan bawah
 * 6. Export menjadi PNG
 *
 * Tidak ada teks tambahan.
 */
export async function generatePrintableQrCard(
  qrItem: QRCodeItem,
  fullPublicUrl: string
): Promise<string> {
  /**
   * Generate QR Code
   */
  const qrDataUrl = await generateQrDataUrl(fullPublicUrl, {
    /**
     * Dibuat 2x lebih besar untuk kualitas hasil yang lebih baik
     */
    width: NFC_QR_CONFIG.size * 2,

    margin: NFC_QR_CONFIG.margin,

    darkColor: NFC_QR_CONFIG.darkColor,

    lightColor: NFC_QR_CONFIG.lightColor,
  });

  return new Promise((resolve) => {
    /**
     * Load gambar template
     */
    const templateImg = new Image();

    templateImg.crossOrigin = 'anonymous';

    templateImg.onload = () => {
      /**
       * Setelah template berhasil dimuat,
       * load QR Code.
       */
      const qrImg = new Image();

      qrImg.crossOrigin = 'anonymous';

      qrImg.onload = () => {
        /**
         * Buat canvas
         */
        const canvas = document.createElement('canvas');

        /**
         * Ambil ukuran asli template
         */
        const width =
          templateImg.naturalWidth ||
          templateImg.width ||
          1000;

        const height =
          templateImg.naturalHeight ||
          templateImg.height ||
          1000;

        canvas.width = width;
        canvas.height = height;

        /**
         * Ambil context canvas
         */
        const ctx = canvas.getContext('2d');

        /**
         * Jika canvas gagal dibuat,
         * fallback ke QR biasa.
         */
        if (!ctx) {
          resolve(qrDataUrl);
          return;
        }

        /**
         * ================================================================
         * 1. Gambar template nfc.png
         * ================================================================
         */
        ctx.drawImage(
          templateImg,
          0,
          0,
          width,
          height
        );

        /**
         * ================================================================
         * 2. Tentukan ukuran QR
         * ================================================================
         */
        const qrSize = NFC_QR_CONFIG.size;

        /**
         * ================================================================
         * 3. Tentukan posisi QR
         * ================================================================
         *
         * Jika x = null:
         * QR otomatis berada di kanan.
         *
         * Jika y = null:
         * QR otomatis berada di bawah.
         */
        const qrX =
          NFC_QR_CONFIG.x !== null
            ? NFC_QR_CONFIG.x
            : width -
            qrSize -
            NFC_QR_CONFIG.paddingRight;

        const qrY =
          NFC_QR_CONFIG.y !== null
            ? NFC_QR_CONFIG.y
            : height -
            qrSize -
            NFC_QR_CONFIG.paddingBottom;

        /**
         * ================================================================
         * 4. Gambar QR Code di kanan bawah
         * ================================================================
         */
        ctx.drawImage(
          qrImg,
          qrX,
          qrY,
          qrSize,
          qrSize
        );

        /**
         * ================================================================
         * 5. Convert canvas menjadi PNG Data URL
         * ================================================================
         */
        resolve(
          canvas.toDataURL('image/png')
        );
      };

      /**
       * Jika QR gagal dimuat,
       * gunakan QR Code biasa sebagai fallback.
       */
      qrImg.onerror = () => {
        resolve(qrDataUrl);
      };

      /**
       * Set sumber gambar QR
       */
      qrImg.src = qrDataUrl;
    };

    /**
     * Jika template gagal dimuat,
     * gunakan QR Code biasa sebagai fallback.
     */
    templateImg.onerror = (err) => {
      console.warn(
        'Gagal memuat template nfc.png, fallback ke QR langsung:',
        err
      );

      resolve(qrDataUrl);
    };

    /**
     * Set sumber template
     */
    templateImg.src = nfcTemplateUrl;
  });
}

/**
 * ============================================================================
 * Download single image berdasarkan Data URL
 * ============================================================================
 */
export function triggerDownload(
  dataUrl: string,
  filename: string
) {
  const link = document.createElement('a');

  link.href = dataUrl;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

/**
 * ============================================================================
 * Bulk download QR Code sebagai ZIP
 * ============================================================================
 *
 * mode:
 *
 * 'simple'
 * → hanya QR Code
 *
 * 'card'
 * → QR Code + template nfc.png
 */
export async function downloadBulkAsZip(
  items: QRCodeItem[],
  baseUrl: string,
  mode: 'simple' | 'card' = 'card',
  onProgress?: (
    current: number,
    total: number
  ) => void
): Promise<void> {
  /**
   * Buat ZIP
   */
  const zip = new JSZip();

  /**
   * Buat folder qr-codes
   */
  const folder = zip.folder('qr-codes');

  /**
   * Loop semua QR
   */
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    /**
     * Buat URL lengkap
     *
     * Contoh:
     * https://domain.com/u8iA0Y
     */
    const fullUrl =
      `${baseUrl.replace(/\/$/, '')}/${item.id}`;

    let dataUrl: string;

    /**
     * Jika mode card,
     * gunakan template nfc.png.
     */
    if (mode === 'card') {
      dataUrl = await generatePrintableQrCard(
        item,
        fullUrl
      );
    } else {
      /**
       * Mode simple:
       * hanya QR Code tanpa template.
       */
      dataUrl = await generateQrDataUrl(
        fullUrl,
        {
          width: 800,
          margin: 2,
        }
      );
    }

    /**
     * Ambil bagian Base64 dari Data URL
     */
    const base64Data =
      dataUrl.split(',')[1];

    /**
     * Nama file
     *
     * Jika ada customSlug:
     * customSlug.png
     *
     * Jika tidak:
     * id.png
     */
    const fileName = item.customSlug
      ? `${item.customSlug}.png`
      : `${item.id}.png`;

    /**
     * Masukkan gambar ke ZIP
     */
    folder?.file(
      fileName,
      base64Data,
      {
        base64: true,
      }
    );

    /**
     * Update progress
     */
    if (onProgress) {
      onProgress(
        i + 1,
        items.length
      );
    }
  }

  /**
   * ==========================================================================
   * Buat CSV
   * ==========================================================================
   */
  const csvHeader =
    'Label_Slug,Random_Key_ID,Full_Redirect_URL,Target_URL,Status\n';

  const csvRows = items
    .map(
      (item) =>
        `"${item.customSlug || item.id}",` +
        `"${item.id}",` +
        `"${baseUrl.replace(/\/$/, '')}/${item.id}",` +
        `"${item.targetUrl || ''}",` +
        `"${item.targetUrl ? 'AKTIF' : 'KOSONG'}"`
    )
    .join('\n');

  /**
   * Masukkan CSV ke ZIP
   */
  folder?.file(
    'daftar_qr.csv',
    csvHeader + csvRows
  );

  /**
   * ==========================================================================
   * Generate ZIP
   * ==========================================================================
   */
  const content =
    await zip.generateAsync({
      type: 'blob',
    });

  /**
   * Buat temporary URL
   */
  const downloadUrl =
    URL.createObjectURL(content);

  /**
   * Download ZIP
   */
  triggerDownload(
    downloadUrl,
    `qr-codes-bundle-${Date.now()}.zip`
  );

  /**
   * Hapus temporary URL
   */
  URL.revokeObjectURL(downloadUrl);
}