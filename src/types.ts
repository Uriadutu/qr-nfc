export interface QRCodeItem {
  id: string; // ID unik/slug (misal "qr001", "tokoku", "menu2026")
  targetUrl: string; // e.g. "https://example.com" or "" (empty)
  createdAt: number;
  updatedAt?: number;
  label?: string; // Nama / judul QR
  scanCount?: number; // Analytic counter
  lastScannedAt?: number;
  isCustomSlug?: boolean; // penanda apakah slug kustom
}

export interface AppSettings {
  customBaseDomain?: string; // Misal "https://qr.toko.com" atau "https://s.id"
}
