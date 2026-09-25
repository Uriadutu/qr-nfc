export interface QRCodeItem {
  id: string; // ID unik 6-karakter random (misal "u8iA0Y") atau ID berurutan ("qr001")
  targetUrl: string; // e.g. "https://example.com" or "" (empty)
  createdAt: number;
  updatedAt?: number;
  label?: string; // Nama / judul QR
  customSlug?: string; // Slug kustom yang diinput (misal "menu", "promo")
  scanCount?: number; // Analytic counter
  lastScannedAt?: number;
  isCustomSlug?: boolean; // penanda apakah slug kustom
}

export interface AppSettings {
  customBaseDomain?: string; // Misal "https://qr.toko.com" atau "https://s.id"
}
