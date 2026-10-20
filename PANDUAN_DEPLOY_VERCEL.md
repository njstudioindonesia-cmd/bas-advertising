# 🚀 PANDUAN DEPLOY KE VERCEL
**Proyek:** Pusat Cetak Padang by BAS Advertising  
**Framework:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + SQLite Backend  

---

## 📋 DAFTAR KEBUTUHAN SEBELUM DEPLOY

Untuk men-deploy web ini ke Vercel, pastikan Anda memiliki:
1. Akun **[GitHub](https://github.com)** (atau GitLab / Bitbucket).
2. Akun **[Vercel](https://vercel.com)** (gratis).
3. Kode proyek ini sudah di-push ke repository GitHub Anda.

---

## ⚙️ ENVIRONMENT VARIABLES (VARIABEL LINGKUNGAN)

Saat membuat proyek di Vercel, tambahkan variabel lingkungan (*Environment Variables*) berikut di menu **Settings -> Environment Variables**:

| Nama Variabel | Wajib? | Contoh Nilai | Deskripsi |
| :--- | :---: | :--- | :--- |
| `ADMIN_USERNAME` | Opsional | `admin` | Username untuk login ke portal "Urang Dalam" (default: `admin`). |
| `ADMIN_PASSWORD` | **Sangat Disarankan** | `UrangDalamBAS2026!#` | Password awal akun admin. Ubah dari default `admin123`. |
| `SESSION_SECRET` | **Wajib** | `bas_adv_padang_secret_key_2026_super_safe_99` | String acak minimal 32 karakter untuk enkripsi sesi admin. |
| `NEXT_PUBLIC_APP_URL` | Opsional | `https://nama-proyek-anda.vercel.app` | Alamat domain publik website Anda di Vercel. |

---

## 🛠️ LANGKAH-LANGKAH DEPLOYMENT (VIA GITHUB)

### Langkah 1: Push Kode ke GitHub
Pastikan semua file sudah di-commit dan di-push ke repository GitHub Anda:
```bash
git add .
git commit -m "feat: persiapkan konfigurasi deploy Vercel"
git push origin main
```

### Langkah 2: Import Proyek di Vercel
1. Masuk ke dashboard **[vercel.com](https://vercel.com)**.
2. Klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari repository GitHub proyek Anda, lalu klik **"Import"**.

### Langkah 3: Konfigurasi Proyek di Vercel
1. **Framework Preset:** Vercel akan otomatis mendeteksi **Next.js**.
2. **Root Directory:** `./` (biarkan default).
3. **Build Command:** `next build` (sudah dikonfigurasi di `vercel.json`).
4. **Install Command:** `npm install` (sudah otomatis).
5. Buka bagian **"Environment Variables"**, lalu masukkan variabel pada tabel di atas.
6. Klik tombol **"Deploy"**.

### Langkah 4: Selesai!
Vercel akan menjalankan build dalam waktu sekitar 1-2 menit. Setelah selesai, website Anda langsung aktif dengan domain gratis seperti `https://bas-advertising-web.vercel.app`.

---

## 💾 ARSITEKTUR DATABASE & SERVERLESS DI VERCEL

Aplikasi ini telah dirancang khusus agar **100% kompatibel dengan arsitektur serverless Vercel**:
1. **Self-Healing Auto-Seed:**
   * Saat Vercel memulai fungsi serverless untuk pertama kalinya, database akan secara otomatis mengisi sendiri **89 produk aktif**, **8 kategori branding**, banner promo, kontak WhatsApp resmi, dan akun admin default.
2. **Penyimpanan Gambar Serverless:**
   * Di lingkungan Vercel (read-only filesystem), sistem upload foto produk di portal admin secara otomatis mengonversi gambar menjadi format *Base64 Data URI* berkualitas tinggi yang tersimpan langsung di database tanpa risiko error filesystem.
3. **Alur Checkout WhatsApp:**
   * Pelanggan mengisi formulir keranjang -> pesanan resmi diterbitkan kode unik format `BAS-YYYYMMDD-XXXX` -> otomatis membuka pesan konfirmasi di WhatsApp admin.

---

## 🔐 MENGAKSES PORTAL ADMIN "URANG DALAM"

Setelah web aktif di Vercel:
1. Buka browser: `https://[domain-anda].vercel.app/urang-dalam-bas-adv`
2. Masukkan kredensial admin:
   * **Username:** `admin` (atau sesuai `ADMIN_USERNAME` di Vercel)
   * **Password:** password yang Anda atur di `ADMIN_PASSWORD` (atau `admin123`)
3. Di tab **Pengaturan**:
   * Ubah nomor WhatsApp resmi workshop percetakan Padang.
   * Periksa rekening bank/QRIS dan jam operasional.
   * Klik **"Simpan & Terapkan Pengaturan"**. Seluruh web langsung menggunakan nomor WA tersebut!
