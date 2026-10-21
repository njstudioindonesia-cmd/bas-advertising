import { db } from "../client";

export const DEFAULT_SETTINGS: Record<string, any> = {
  "site.name": "Cetak.inc",
  "site.tagline": "Modern Printing & Advertising Studio",
  "site.description": "Premium printing & advertising studio delivering precision and perfection.",
  "contact.whatsapp": "6281234567890",
  "contact.email": "hello@basadvertising.com",
  "contact.address": "Jl. Percetakan Modern No.88, Kota Padang, Sumatera Barat",
  "contact.hours": "Senin - Sabtu: 08:30 - 21:00 WIB",
  "location.chipLabel": "Kota Padang & Sekitarnya",
  "social.instagram": "@basadvertising",
  "social.tiktok": "@basadvpadang",
  "checkout.paymentMethods": [
    { id: "QRIS", name: "QRIS Instant", enabled: true, details: "Scan QRIS via GoPay, OVO, Dana, BCA, Livin" },
    { id: "Transfer Bank", name: "Transfer Bank", enabled: true, details: "BCA 1234-567-890 a/n BAS Advertising" },
    { id: "COD / Kasir", name: "Bayar di Workshop / Kasir", enabled: true, details: "Pembayaran langsung saat ambil pesanan" }
  ],
  "checkout.deliveryMethods": [
    { id: "kirim", name: "Kirim ke Alamat", enabled: true, note: "Kurir lokal Padang & Ekspedisi" },
    { id: "pickup", name: "Ambil di Toko / Workshop", enabled: true, note: "Gratis tanpa ongkir" }
  ],
  "checkout.waTemplate": "*HALO CETAK.INC, SAYA INGIN PESAN:*\n----------------------------------------\n*No. Pesanan:* {code}\n*Nama:* {nama}\n*WhatsApp:* {phone}\n*Metode:* {metode}\n*Alamat:* {alamat}\n*Pembayaran:* {pembayaran}\n*Catatan:* {catatan}\n----------------------------------------\n*RINCIAN PESANAN:*\n{items}\n----------------------------------------\n*TOTAL:* *{total}*\n----------------------------------------\nMohon diproses, terima kasih!",
  "home.promoTitle": "Diskon 25% Hari Ini",
  "home.promoSubtitle": "Spesial Branding Cafe, Resto & Bisnis",
};

export function getSettings(): Record<string, any> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as any[];
  const result = { ...DEFAULT_SETTINGS };

  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }

  return result;
}

export function getSetting<T = any>(key: string, defaultValue?: T): T {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as any;
  if (!row) return (defaultValue !== undefined ? defaultValue : DEFAULT_SETTINGS[key]) as T;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return row.value as T;
  }
}

export function setSetting(key: string, value: any): void {
  const now = new Date().toISOString();
  const valString = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, valString, now);
}

export function setMultipleSettings(settingsMap: Record<string, any>): void {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);

  for (const [k, v] of Object.entries(settingsMap)) {
    stmt.run(k, JSON.stringify(v), now);
  }
}
