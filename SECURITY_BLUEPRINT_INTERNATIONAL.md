# BLUEPRINT ARSITEKTUR KEAMANAN SISTEM TINGKAT INTERNASIONAL
**Platform Percetakan On-Demand Multi-Titik — Cetak.inc (BAS Advertising Padang)**  
*Dokumen Standar Keamanan Enterprise: Kepatuhan OWASP Top 10 (2021), OWASP API Security (2023), NIST SP 800-53, ISO/IEC 27001, dan UU No. 27/2022 (UU PDP)*

---

## 1. Ringkasan Eksekutif & Sasaran Keamanan

Dokumen ini mendefinisikan arsitektur, kebijakan, dan panduan kode perbaikan terperinci untuk mengeliminasi seluruh celah keamanan teknis pada sistem **Cetak.inc**, meningkatkan postur keamanan aplikasi (*Security Posture*) dari tingkat menengah menjadi **Enterprise Grade (Standar Internasional)**.

### Prinsip Utama Pertahanan (*Defense-in-Depth*):
1. **Zero Trust Architecture (ZTA)**: Setiap permintaan API diperlakukan sebagai potensi ancaman; tidak ada kepercayaan implisit berdasarkan IP, rute, atau keberadaan data tanpa otorisasi eksplisit.
2. **Zero-Client-Secret Policy**: Tidak ada token rahasia, kredensial cadangan, atau API key backend yang diizinkan berada di sisi browser (*frontend/localStorage*).
3. **Fail-Closed Principle**: Jika parameter otorisasi (seperti token akses invoice) tidak disediakan atau tidak cocok, sistem wajib menolak akses secara mutlak (*reject by default*).
4. **Data Minimization & PII Masking**: Informasi pribadi pelanggan (nama, nomor telepon, alamat, GPS) wajib disamarkan pada antarmuka publik sesuai amanat UU Perlindungan Data Pribadi (UU PDP).

---

## 2. Matriks Celah Keamanan & Solusi Standar Internasional

| No | Vektor Ancaman (Threat Vector) | Klasifikasi OWASP | Lapisan Pertahanan Enterprise | Status |
|---|---|---|---|:---:|
| 1 | **IDOR pada Invoice Publik** (`/api/invoices/[no]`) | OWASP API1:2023 (BOLA) | Token hash heksadesimal 32-karakter wajib ada dan cocok persis; bypass hanya untuk sesi Admin terotentikasi. | Siap Diterapkan |
| 2 | **Stored XSS via File SVG** (`/api/upload`) | OWASP A03:2021 (Injection) | Karantina ketat: Folder publik transaksi hanya menerima raster murni (JPG/PNG/WEBP) & di-rekompresi ulang oleh Sharp. | Siap Diterapkan |
| 3 | **PII Harvester di Tracking** (`/api/orders/track`) | OWASP A01:2021 (Broken Access) / UU PDP | Sanitasi karakter filter injection PostgREST + PII Masking pada nama, nomor telepon, dan alamat fisik. | Siap Diterapkan |
| 4 | **Client-Side Ongkir Tampering** (`createOrder`) | OWASP A04:2021 (Insecure Design) | Rekalkulasi ongkir otoritatif di sisi server berbasis koordinat & aturan gratis ongkir $\ge$ Rp 300.000. | Siap Diterapkan |
| 5 | **Bypass Password Backdoor** | OWASP A07:2021 (Identification Failures) | Eliminasi total fallback password hardcoded (`admin123` / `UrangDalamBAS2026!#`). Selesai di Commit `71613e8`. | ✅ Selesai |
| 6 | **Pencurian Token via XSS** | OWASP A03 / A07 | Eliminasi penyimpanan token di `localStorage`. Migrasi murni ke cookie `HttpOnly; SameSite=Lax`. | ✅ Selesai |
| 7 | **Bocoran Rute Privat di Service Worker** | OWASP A05:2021 (Security Misconfiguration) | Migrasi Service Worker dari Blacklist ke Strict Whitelist (`PUBLIC_OFFLINE_ROUTES`). Selesai di Commit `5cb4951`. | ✅ Selesai |

---

## 3. Rincian Teknis & Kode Perbaikan (Secure Code Refactoring)

### 3.1. Remediasi Celah 1: Broken Object Level Authorization (IDOR) pada Invoice
* **Berkas Target**: `src/modules/invoices/generator.ts` & `src/app/api/invoices/[no]/route.ts`
* **Prinsip**: Pengguna umum **wajib** menyertakan parameter `?token=` yang valid. Tanpa token atau jika token salah, server merespons 404/401 tanpa kompromi. Sesi Admin Urang Dalam diberikan bypass sah untuk keperluan operasional.

### 3.2. Remediasi Celah 2: Stored XSS & Unrestricted File Upload pada Bukti Bayar
* **Berkas Target**: `src/app/api/upload/route.ts`
* **Prinsip**: File SVG dilarang keras untuk publik. Folder `payment-proofs` dan `delivery-proofs` hanya menerima raster bitmap (`image/jpeg`, `image/png`, `image/webp`). Sharp memproses ulang buffer gambar menjadi WebP aman.

### 3.3. Remediasi Celah 3: PII Data Harvester & Filter Injection pada Tracking
* **Berkas Target**: `src/app/api/orders/track/route.ts`
* **Prinsip**: Input query dibersihkan dari karakter berbahaya. Nama pelanggan disamarkan (`Budi P.***`), nomor HP disamarkan (`0812****567`), dan alamat lengkap disamarkan untuk publik.

### 3.4. Remediasi Celah 4: Server-Side Dynamic Shipping Verification (Anti-Tampering)
* **Berkas Target**: `src/lib/db/queries/orders.ts`
* **Prinsip**: Server tidak memercayai `deliveryFee` dari request body klien. Ongkir dihitung ulang secara otoritatif di backend menggunakan modul tarif dinamis.

---

## 4. Rencana Tindak Lanjut

Untuk menerapkan seluruh spesifikasi ini secara permanen ke sistem:
1. Terapkan refactoring pada 4 file target di atas.
2. Jalankan unit test verifikasi keamanan (`npx tsx scratch/...`).
3. Verifikasi build produksi (`npx tsc --noEmit` & `npm run build`).
4. Commit dan push ke GitHub remote `origin/main`.
