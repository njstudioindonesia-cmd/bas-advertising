# CETAK.INC — BLUEPRINT UPDATE V2
**Platform Percetakan On-Demand Multi-Titik (Versi "Astro / GoFood" untuk Percetakan)**
*Basis: PROGRESS_REPORT.md — commit `07e0721` (Next.js 16 + Supabase + PWA)*

> Dokumen ini adalah spesifikasi kerja untuk AI coding agent. Kerjakan **per fase** (Bagian 12), jangan semua sekaligus. Setiap fase harus lulus `tsc` (0 error) dan `next build` sebelum lanjut. **Jangan merusak fitur yang sudah live** (katalog, keranjang, mockup, /lacak, PWA, admin dispatcher).

---

## 0. Catatan Realistis (WAJIB DIBACA AGENT)

Beberapa permintaan punya batasan nyata. Blueprint ini sudah menyesuaikannya agar **tetap gratis dan benar-benar jalan**:

| Permintaan | Kenyataan | Solusi di blueprint ini |
|---|---|---|
| Tracking via **Google Maps** | Google Maps Platform butuh akun billing (kartu kredit) walau ada kuota gratis; risiko tagihan jika traffic naik | Peta default: **Leaflet + OpenStreetMap** (gratis, tanpa kartu). Lapisan `MapProvider` dibuat *adapter*, jadi bisa ganti ke Google Maps hanya dengan isi API key |
| Harga ongkir **Gojek** otomatis | Gojek/GoSend API hanya untuk mitra bisnis resmi, bukan publik/gratis | **Mesin tarif internal** (jarak × tarif per zona yang bisa diatur admin) + input *quote manual* admin untuk Gojek/Maxim/Grab. Adapter siap dicolok jika nanti punya akses API resmi |
| Semua API gratis | Ada batas kuota di tier gratis | Semua layanan di Bagian 9 punya tier gratis permanen; ada *fallback* jika kuota habis |
| "Microsystem tanpa kendala" | Microservices sungguhan (banyak server) itu mahal & rumit untuk 1 developer | **Modular monolith**: satu codebase, modul terpisah ketat, komunikasi lewat *event* — gagal di satu modul tidak menjatuhkan modul lain |
| Tracking kurir live | GPS web hanya jalan saat halaman driver terbuka (batasan browser, terutama iOS) | Halaman driver dibuat PWA, layar tetap menyala (Wake Lock), kirim lokasi tiap 10 detik, tampilkan status "terakhir update X detik lalu" |

---

## 1. Tujuan & Prinsip

1. Pengalaman setara aplikasi quick-commerce (Astro/GoFood): cepat, mulus, mobile-first, tidak kaku di desktop.
2. **4 peran** dengan area terpisah: Pelanggan, Admin, Vendor (percetakan/workshop), Driver.
3. **Multi-titik workshop**: pesanan otomatis diarahkan ke workshop terdekat dari alamat pelanggan.
4. **Pembayaran hanya lewat admin** (manual terverifikasi) — tidak ada payment gateway pihak ketiga.
5. Semua **gratis** dan **tahan gagal** (fallback di setiap integrasi eksternal).
6. Setiap perubahan **backward-compatible** dengan data & rute yang sudah ada.

---

## 2. Arsitektur "Microsystem" (Modular Monolith)

Satu aplikasi Next.js, dipecah menjadi **modul domain independen**. Aturan emas: modul **tidak boleh import langsung isi modul lain**; hanya lewat `index.ts` (public API) atau **event**.

```
src/
├─ modules/
│  ├─ catalog/        # produk, kategori, harga (sudah ada)
│  ├─ orders/         # state machine pesanan
│  ├─ hubs/           # titik workshop/vendor + routing otomatis
│  ├─ delivery/       # ongkir, kurir, tracking
│  ├─ payments/       # pembayaran manual via admin
│  ├─ invoices/       # penerbitan & render invoice
│  ├─ geo/            # geocoding, deteksi lokasi, jarak
│  ├─ notifications/  # web push, WA link, in-app
│  └─ auth/           # peran & permission
├─ adapters/          # pembungkus layanan eksternal (bisa diganti)
│  ├─ map/            # leaflet-osm.ts | google-maps.ts
│  ├─ geocoder/       # nominatim.ts | photon.ts | manual.ts
│  ├─ routing/        # osrm.ts | haversine.ts (fallback)
│  └─ shipping/       # internal-tariff.ts | manual-quote.ts | gosend.ts (nonaktif)
├─ app/
│  ├─ (customer)/     # beranda, produk, keranjang, checkout, lacak, akun
│  ├─ urang-dalam-bas-adv/   # admin (sudah ada)
│  ├─ vendor/         # BARU — portal vendor/percetakan
│  ├─ driver/         # BARU — portal driver (PWA)
│  └─ api/
└─ lib/events/        # event bus ringan (outbox di DB)
```

### Pola ketahanan (agar "tanpa hambatan")
- **Adapter + fallback**: tiap layanan eksternal punya cadangan. Contoh: OSRM gagal → hitung jarak Haversine × faktor 1.3. Geocoder gagal → pelanggan pin manual di peta.
- **Outbox events**: perubahan penting (`ORDER_PAID`, `ORDER_ASSIGNED`, `DRIVER_ASSIGNED`, dst.) ditulis ke tabel `events`; konsumer (notifikasi, invoice) memprosesnya terpisah dan bisa di-*retry*. Kalau notifikasi gagal, pesanan tetap aman.
- **Idempoten**: semua endpoint tulis menerima `idempotency_key`.
- **Feature flag** di tabel `settings` (mis. `feature.google_maps`, `feature.gosend_api`) — fitur bisa dimatikan dari admin tanpa deploy.
- **Error boundary** per halaman; satu widget gagal tidak merusak seluruh halaman.

---

## 3. Peran, Halaman & Hak Akses

| Peran | Area | Fungsi utama |
|---|---|---|
| **Pelanggan** | `/`, `/produk`, `/keranjang`, `/checkout`, `/lacak`, `/akun`, `/invoice/[no]` | Belanja, pilih/deteksi lokasi, bayar via admin, lacak live |
| **Admin** | `/urang-dalam-bas-adv/*` | Kelola semuanya: hub, vendor, tarif, pembayaran, penugasan, invoice |
| **Vendor** | `/vendor/*` | Terima & produksi pesanan di titiknya, update status produksi, siap-antar |
| **Driver** | `/driver/*` | Terima tugas antar, navigasi, kirim lokasi live, bukti serah terima |

### Halaman baru
**Vendor (`/vendor`)** — login Supabase Auth, mobile-first:
- `/vendor` — dashboard: pesanan masuk, sedang diproduksi, siap-antar (kartu bergaya antrian dapur)
- `/vendor/pesanan/[id]` — detail, file desain, tombol: *Terima → Produksi → Selesai/Siap Antar*, cetak SPK
- `/vendor/profil` — jam operasional, status buka/tutup, kapasitas

**Driver (`/driver`)** — PWA, tombol besar, satu tangan:
- `/driver` — toggle **Online/Offline**, daftar tugas tersedia/ditugaskan
- `/driver/tugas/[id]` — peta rute (jemput → antar), tombol *Sudah Dijemput → Dalam Perjalanan → Tiba → Selesai*, upload foto bukti, tombol WA pelanggan, tombol buka navigasi (deep link ke Google Maps / Waze — gratis, tanpa API key)
- `/driver/riwayat` — riwayat & rekap tugas

> **Akses**: Role disimpan di tabel `profiles.role` (`customer|admin|vendor|driver`). Proteksi dua lapis: middleware Next.js **dan** Supabase RLS. Vendor hanya melihat pesanan `hub_id` miliknya; driver hanya tugas yang ditugaskan kepadanya.

---

## 4. Sistem Multi-Hub (Titik Workshop) & Routing Otomatis

### 4.1 Konsep
Setiap workshop/percetakan = satu **Hub**. Pesanan diarahkan ke hub berdasarkan lokasi pelanggan.

**Contoh logika (permintaan #9):** pelanggan beralamat di **Lubuk Buaya** → dicetak & dikirim dari **Hub Lubuk Buaya**; pelanggan di area lain → hub terdekat yang mampu.

### 4.2 Algoritma `assignHub(order)` — modul `hubs`
1. Ambil koordinat tujuan (hasil deteksi/pin pelanggan).
2. **Aturan area prioritas** (admin bisa atur): tabel `hub_service_areas` memetakan kelurahan/kecamatan/radius → hub. Jika alamat cocok (mis. "Lubuk Buaya") → pakai hub tersebut.
3. Jika tidak ada aturan: filter hub `is_active = true`, `is_open_now = true`, dalam `max_radius_km`, dan mampu memproduksi **semua item** di keranjang (`hub_products`).
4. Urutkan berdasarkan jarak (OSRM, fallback Haversine) lalu beban antrean → pilih teratas.
5. Jika tidak ada hub memenuhi → status `MENUNGGU_PENUGASAN_ADMIN` (admin pilih manual).
6. Admin selalu bisa **override** hub dari panel; riwayat perubahan dicatat.
7. Pesanan campuran (item dari hub berbeda) → **pecah menjadi sub-order per hub** (`order_parts`), ongkir dihitung per bagian.

### 4.3 Database hub (permintaan #11)
Halaman admin `/urang-dalam-bas-adv/hub` — tabel CRUD:
- Tambah / edit / nonaktifkan hub (nama, alamat, **pin peta**, kontak, jam buka, radius layanan, kapasitas harian, catatan)
- Atur produk yang bisa dibuat tiap hub (`hub_products`) & markup harga khusus (opsional)
- Atur area layanan (`hub_service_areas`: nama area, polygon/radius, prioritas)
- Hubungkan akun vendor ke hub; lihat beban pesanan live per hub
- **Seed awal**: Hub Padang (Workshop BAS Advertising — sudah ada) dan Hub Lubuk Buaya (isi alamat & koordinat via admin)

---

## 5. Deteksi Lokasi Pemesan (Permintaan #10)

**Alur di checkout:**
1. Tombol **"📍 Gunakan Lokasi Saya"** → `navigator.geolocation.getCurrentPosition` (butuh HTTPS — Vercel sudah HTTPS; izin dimintai saat tombol diklik, bukan otomatis).
2. Koordinat → **reverse geocoding** (Nominatim/Photon) → isi alamat otomatis.
3. Peta kecil dengan **pin yang bisa digeser**; pelanggan konfirmasi titik. Tambah kolom *patokan/catatan alamat*.
4. **Fallback** jika izin ditolak/GPS gagal: pencarian alamat (autocomplete geocoder) atau pilih kelurahan dari daftar, lalu geser pin.
5. Simpan beberapa **alamat tersimpan** per pelanggan (rumah, kantor).
6. Koordinat disimpan di pesanan (`dest_lat`, `dest_lng`) → dipakai routing hub, ongkir, dan peta tracking.

**Catatan privasi:** tampilkan alasan izin lokasi; lokasi pelanggan hanya terlihat oleh admin, vendor hub terkait, dan driver yang bertugas.

---

## 6. Ongkir & Pengantaran (Permintaan #4)

### 6.1 Modul `delivery/shipping` — satu antarmuka, beberapa penyedia
```ts
interface ShippingProvider {
  id: string;
  quote(input: { from: LatLng; to: LatLng; weightKg?: number; hubId: string }):
    Promise<{ price: number; etaMin: number; label: string } | null>;
}
```

| Provider | Status | Cara kerja |
|---|---|---|
| `internal-tariff` | **Aktif (default)** | `harga = base_fee + (jarak_km × per_km)`, min. tarif, kelipatan Rp 500, **tarif per hub & per zona** diatur admin. Kurir internal / mitra lokal |
| `manual-quote` | **Aktif** | Admin memasukkan harga GoSend/Maxim/Grab/J&T aktual (cek aplikasi) lalu pelanggan melihat total final sebelum bayar |
| `rajaongkir` | Opsional | Hanya untuk ekspedisi reguler antar kota (tier gratis terbatas) — bukan same-day |
| `gosend` | **Nonaktif** (flag) | Adapter kosong siap dicolok bila memperoleh akses API mitra resmi |

### 6.2 Aturan
- Tampilkan **estimasi ongkir saat checkout** (dari `internal-tariff`), label "Estimasi — total final dikonfirmasi admin" bila memakai quote manual.
- Opsi pengiriman: *Kurir Internal (Instan)*, *Ambil di Workshop (gratis)*, *Kurir Pihak Ketiga (quote admin)*.
- Pengaturan tarif di admin `/urang-dalam-bas-adv/tarif` (base, per km, jarak maks, jam sibuk, gratis ongkir minimal belanja).
- Ongkir **dikunci (snapshot)** di pesanan saat dikonfirmasi admin agar invoice konsisten.

---

## 7. Tracking Real-Time (Permintaan #2)

### 7.1 Komponen
- **Peta**: `MapProvider` (adapter). Default Leaflet + tile OpenStreetMap/Carto. Jika `feature.google_maps = true` dan API key tersedia → Google Maps JS API.
- **Rute**: OSRM publik (gratis, tanpa key) → polyline jalan sebenarnya; fallback garis lurus + estimasi Haversine.
- **Lokasi driver**: `driver/tugas/[id]` memanggil `watchPosition`, kirim ke `POST /api/driver/location` tiap **10 detik** (hanya saat tugas aktif) → tabel `driver_locations` (upsert 1 baris per driver).
- **Siaran ke pelanggan**: **Supabase Realtime** (channel `order:{id}`) — pelanggan di `/lacak` menerima posisi kurir tanpa polling. Fallback polling 10 detik jika WebSocket gagal.
- **Timeline status** ala GoFood: Dipesan → Dibayar → Diproduksi → Siap Antar → Kurir Menjemput → Dalam Perjalanan → Tiba → Selesai.
- **ETA** dihitung ulang dari posisi driver ke tujuan.

### 7.2 Detail teknis penting
- Gunakan **Screen Wake Lock API** di halaman driver agar layar tidak mati.
- Tampilkan "Lokasi diperbarui X detik lalu"; jika >60 detik tampilkan peringatan lembut ke pelanggan, bukan error.
- Throttle: jangan kirim jika perpindahan <15 m dan <10 detik.
- Hapus/anonimkan `driver_locations` setelah tugas selesai (privasi & hemat kuota).
- Tombol navigasi driver memakai **deep link** `https://www.google.com/maps/dir/?api=1&destination=lat,lng` (gratis, tidak butuh API key).

---

## 8. Pembayaran Via Admin & Invoice (Permintaan #7, #8)

### 8.1 Alur pembayaran (tanpa gateway)
1. Pelanggan checkout → pesanan `MENUNGGU_PEMBAYARAN` + **invoice dibuat otomatis** (status *Belum Dibayar*).
2. Halaman pembayaran menampilkan **instruksi dari admin**: QRIS statis/transfer bank (diatur di admin), **kode unik** 3 digit di nominal untuk memudahkan pencocokan, batas waktu bayar.
3. Pelanggan **upload bukti bayar** (kompres WebP, ke Supabase Storage) atau konfirmasi via WA.
4. **Admin** membuka antrean `/urang-dalam-bas-adv/pembayaran` → *Verifikasi* / *Tolak (dengan alasan)*.
5. Verifikasi → `ORDER_PAID` → pesanan **otomatis** di-routing ke hub (Bagian 4) → vendor diberi notifikasi.
6. Vendor & driver **tidak pernah** menangani uang pelanggan (tidak ada tombol bayar di portal mereka). COD tidak diaktifkan kecuali admin menyalakan flag.
7. Pesanan tidak dibayar sampai batas waktu → otomatis `KEDALUWARSA` (cron gratis Vercel/Supabase pg_cron).
8. Semua tindakan keuangan masuk **audit log** (siapa, kapan, sebelum/sesudah).

### 8.2 Invoice profesional
- **Nomor**: `INV/CTK/2026/10/000123` (urut, unik, tidak bisa diubah setelah terbit).
- **Isi**: logo & identitas (BAS Advertising / Cetak.inc, alamat, kontak, NPWP bila ada), data pelanggan, hub produksi, tabel item (spesifikasi cetak, ukuran P×L, qty, harga satuan, subtotal), ongkir, diskon, kode unik, **total**, status (BELUM DIBAYAR / LUNAS), info rekening/QRIS, syarat & catatan, **QR code** verifikasi (`/invoice/[no]?t=token`), area tanda tangan/stempel.
- **Format**: halaman web `/invoice/[no]` yang rapi di layar **dan** CSS `@media print` (A4). Tombol **Unduh PDF** (library `@react-pdf/renderer` atau print-to-PDF) dan **Kirim via WhatsApp** (link `wa.me` dengan tautan invoice).
- **Dokumen terkait**: Kuitansi (saat lunas), SPK untuk vendor (tanpa harga jual), dan label pengiriman untuk driver.
- Template invoice dapat diatur admin (logo, footer, rekening, catatan).
- Akses invoice publik dilindungi **token acak** di URL, bukan nomor urut saja.

---

## 9. Daftar Layanan & API (Semua Gratis)

| Kebutuhan | Layanan | Biaya | Batas / catatan |
|---|---|---|---|
| Hosting | Vercel Hobby | Gratis | Hobby plan untuk non-komersial; bila usaha sudah komersial pertimbangkan Cloudflare Pages / VPS murah |
| Database, Auth, Storage, Realtime | Supabase Free | Gratis | 500 MB DB, 1 GB storage, Realtime terbatas; proyek di-*pause* jika tak aktif 1 minggu — aktifkan cron ping |
| Peta tampilan | Leaflet + OSM / Carto | Gratis | Wajib atribusi; hindari beban tile berat |
| Rute & jarak | OSRM demo server | Gratis | Server demo tanpa SLA → wajib fallback Haversine; bisa self-host nanti |
| Geocoding / reverse | Nominatim (OSM) atau Photon | Gratis | Nominatim: maks 1 permintaan/detik, wajib User-Agent, **cache hasil**; jangan autocomplete tiap ketikan (debounce ≥ 600 ms) |
| Deteksi lokasi | Browser Geolocation API | Gratis | Butuh HTTPS & izin pengguna |
| Notifikasi | Web Push (VAPID) + link WhatsApp `wa.me` | Gratis | iOS butuh PWA terpasang di Home Screen |
| Kode QR | library `qrcode` (lokal) | Gratis | Tanpa API eksternal |
| PDF invoice | `@react-pdf/renderer` / print CSS | Gratis | Dibuat di server/klien |
| Cron | Vercel Cron / Supabase pg_cron | Gratis | Terbatas frekuensi di tier gratis |
| Google Maps (opsional) | Google Maps Platform | Perlu billing | Hanya jika Anda mau; **bukan default** |
| Ongkir ekspedisi reguler (opsional) | RajaOngkir Starter | Gratis terbatas | Bukan same-day |

> **Aturan**: tidak ada API berbayar yang aktif secara default. Semua key disimpan di environment variable, tidak pernah di kode klien kecuali kunci publik.

### Environment variables baru
```
NEXT_PUBLIC_MAP_PROVIDER=osm           # osm | google
NEXT_PUBLIC_GOOGLE_MAPS_KEY=           # opsional
OSRM_BASE_URL=https://router.project-osrm.org
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=cetakinc/1.0 (kontak@domainanda)
VAPID_PUBLIC_KEY= / VAPID_PRIVATE_KEY=
CRON_SECRET=
```

---

## 10. Desain Database (Supabase / PostgreSQL)

Tabel **baru** (yang sudah ada tetap; tambahkan kolom lewat migrasi non-destruktif):

```sql
-- Peran
create table profiles (
  id uuid primary key references auth.users(id),
  role text not null check (role in ('customer','admin','vendor','driver')) default 'customer',
  full_name text, phone text, hub_id uuid, created_at timestamptz default now()
);

-- Titik workshop / percetakan
create table hubs (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text unique,
  address text, lat double precision not null, lng double precision not null,
  phone text, whatsapp text,
  max_radius_km numeric default 15,
  daily_capacity int default 50,
  opening_hours jsonb,            -- {"mon":["08:00","17:00"],...}
  is_active boolean default true, is_open boolean default true,
  notes text, created_at timestamptz default now()
);
create table hub_service_areas (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references hubs(id) on delete cascade,
  area_name text not null,        -- mis. 'Lubuk Buaya'
  center_lat double precision, center_lng double precision, radius_km numeric,
  priority int default 0
);
create table hub_products (
  hub_id uuid references hubs(id) on delete cascade,
  product_id text not null,       -- sesuaikan tipe dengan tabel produk
  price_override numeric, is_available boolean default true,
  primary key (hub_id, product_id)
);

-- Tambahan di orders (ALTER, nullable agar kompatibel)
alter table orders
  add column hub_id uuid references hubs(id),
  add column dest_lat double precision, add column dest_lng double precision,
  add column dest_address text, add column dest_note text,
  add column delivery_method text, add column delivery_fee numeric default 0,
  add column unique_code int default 0, add column payment_status text default 'UNPAID',
  add column idempotency_key text unique;

-- Pembayaran manual
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id), amount numeric not null,
  proof_url text, status text default 'PENDING',  -- PENDING|VERIFIED|REJECTED
  verified_by uuid, verified_at timestamptz, reject_reason text,
  created_at timestamptz default now()
);

-- Invoice
create table invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text unique not null, public_token text unique not null,
  order_id uuid references orders(id), issued_at timestamptz default now(),
  paid_at timestamptz, snapshot jsonb not null     -- salinan data saat terbit
);

-- Driver & lokasi
create table drivers (
  id uuid primary key references profiles(id),
  vehicle_type text, plate text, is_online boolean default false, hub_id uuid
);
create table delivery_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id), driver_id uuid references drivers(id),
  provider text default 'internal', status text default 'ASSIGNED',
  pickup_proof_url text, dropoff_proof_url text,
  eta_min int, started_at timestamptz, finished_at timestamptz
);
create table driver_locations (
  driver_id uuid primary key references drivers(id),
  lat double precision, lng double precision, heading real, speed real,
  updated_at timestamptz default now()
);

-- Tarif ongkir, pengaturan, event, audit
create table shipping_tariffs (
  id uuid primary key default gen_random_uuid(), hub_id uuid references hubs(id),
  base_fee numeric, per_km numeric, min_fee numeric, max_km numeric,
  free_over numeric, is_active boolean default true
);
create table settings (key text primary key, value jsonb);
create table events (
  id bigserial primary key, type text, payload jsonb,
  status text default 'PENDING', attempts int default 0, created_at timestamptz default now()
);
create table audit_logs (
  id bigserial primary key, actor uuid, action text, entity text, entity_id text,
  before jsonb, after jsonb, created_at timestamptz default now()
);
```

### RLS (ringkas — wajib diaktifkan)
- `orders`: pelanggan = miliknya; vendor = `hub_id` miliknya; driver = via `delivery_tasks`; admin = semua.
- `payments`, `invoices` (tulis): hanya admin; pelanggan boleh insert bukti bayar miliknya.
- `driver_locations`: driver tulis miliknya; pelanggan baca hanya jika terkait tugas pesanannya.
- Status pesanan hanya boleh berubah lewat **fungsi server** yang memvalidasi transisi (bukan update bebas dari klien).

### State machine pesanan
```
DRAFT → MENUNGGU_PEMBAYARAN → MENUNGGU_VERIFIKASI → DIBAYAR
→ MENUNGGU_PENUGASAN_ADMIN (jika auto-routing gagal) → DITERIMA_VENDOR → DIPRODUKSI → SIAP_ANTAR
→ KURIR_MENJEMPUT → DALAM_PERJALANAN → TIBA → SELESAI
Cabang: DIBATALKAN, KEDALUWARSA, DITOLAK_VENDOR (→ kembali ke routing/admin), PEMBAYARAN_DITOLAK
```
Setiap transisi: siapa yang boleh, event yang dipancarkan, dan notifikasi yang dikirim didefinisikan di satu file `orders/state-machine.ts`.

---

## 11. Daftar Endpoint API Internal

| Endpoint | Metode | Peran | Fungsi |
|---|---|---|---|
| `/api/geo/reverse` | GET | publik (rate-limit) | Reverse geocode + cache |
| `/api/geo/search` | GET | publik (rate-limit) | Cari alamat |
| `/api/shipping/quote` | POST | pelanggan | Estimasi ongkir (hub + tujuan) |
| `/api/orders` | POST | pelanggan | Buat pesanan (idempoten) |
| `/api/orders/[id]/payment-proof` | POST | pelanggan | Upload bukti bayar |
| `/api/admin/payments/[id]/verify` | POST | admin | Verifikasi / tolak |
| `/api/admin/orders/[id]/assign-hub` | POST | admin | Override hub |
| `/api/admin/hubs` (+ `/[id]`) | CRUD | admin | Database titik percetakan |
| `/api/admin/hubs/[id]/areas`, `/products` | CRUD | admin | Area layanan & produk hub |
| `/api/admin/tariffs` | CRUD | admin | Tarif ongkir |
| `/api/admin/delivery/[orderId]/assign` | POST | admin | Tugaskan driver |
| `/api/vendor/orders` | GET | vendor | Antrean hub |
| `/api/vendor/orders/[id]/status` | POST | vendor | Terima/produksi/siap |
| `/api/driver/tasks` | GET | driver | Tugas |
| `/api/driver/tasks/[id]/status` | POST | driver | Update status + bukti |
| `/api/driver/location` | POST | driver | Kirim posisi |
| `/api/track/[orderId]` | GET | pelanggan (token) | Data tracking |
| `/api/invoices/[no]` | GET | token | Data invoice / PDF |
| `/api/cron/expire-orders` | GET | cron (secret) | Kedaluwarsakan pesanan |
| `/api/push/subscribe` | POST | login | Simpan langganan push |

Semua endpoint: validasi input (Zod), cek peran, rate-limit sederhana, balasan JSON seragam `{ ok, data, error }`.

---

## 12. Rencana Eksekusi Bertahap (Untuk Agent)

**Aturan tiap fase:** buat branch, jalankan `tsc --noEmit` + `next build`, uji manual di mobile 375px & desktop, baru merge. Jangan ubah rute/fitur lama tanpa kompatibilitas.

### Fase 1 — Fondasi
- Migrasi SQL (Bagian 10), `profiles` & role, middleware proteksi rute, RLS, `settings`, `audit_logs`, `events`.
- Refactor ke struktur `modules/` + `adapters/` tanpa mengubah perilaku.
- ✅ Selesai bila: login 4 peran berfungsi; fitur lama tidak berubah.

### Fase 2 — Multi-Hub & Lokasi
- CRUD Hub di admin (Bagian 4.3), seed Hub Padang + Hub Lubuk Buaya.
- Deteksi lokasi + pin peta + alamat tersimpan di checkout (Bagian 5).
- `assignHub()` + aturan area (Lubuk Buaya) + override admin.
- ✅ Bila: alamat Lubuk Buaya → hub Lubuk Buaya; alamat lain → hub terdekat; keranjang campuran terpecah.

### Fase 3 — Ongkir
- `ShippingProvider` + `internal-tariff` + `manual-quote`, halaman tarif admin, estimasi di checkout.
- ✅ Bila: ongkir berubah mengikuti jarak & hub; fallback Haversine terbukti saat OSRM dimatikan.

### Fase 4 — Pembayaran via Admin & Invoice
- Alur bukti bayar, antrean verifikasi admin, kode unik, kedaluwarsa otomatis.
- Invoice web + print A4 + PDF + QR + WA share; kuitansi; SPK.
- ✅ Bila: verifikasi admin memicu routing otomatis & invoice berubah LUNAS.

### Fase 5 — Portal Vendor
- `/vendor` (dashboard, detail, update status, SPK, jam buka).
- ✅ Bila: vendor hanya melihat pesanan hub-nya; status sinkron ke pelanggan.

### Fase 6 — Portal Driver & Live Tracking
- `/driver` PWA, tugas, kirim lokasi, Wake Lock, bukti foto, deep link navigasi.
- Penugasan driver oleh admin (manual dulu; auto-dispatch fase lanjut).
- Peta `/lacak` pakai Realtime + rute OSRM + ETA; adapter Google Maps (opsional).
- ✅ Bila: pelanggan melihat motor bergerak tanpa refresh; fallback polling jalan.

### Fase 7 — UX "Tidak Kaku"
- Lihat Bagian 13.

### Fase 8 — Hardening
- Rate-limit, validasi Zod menyeluruh, error boundary, monitoring log, backup DB mingguan, uji beban ringan, cron ping Supabase.

---

## 13. Desain & Pengalaman Pengguna (Permintaan #1, #6)

**Mobile (utama):** bottom navigation, sheet bawah (bottom sheet) untuk keranjang/opsi, skeleton loading, optimistic UI, swipe antar kategori, status pesanan sebagai kartu bergaya GoFood, sticky checkout bar, area sentuh ≥ 44 px, tetap kunci viewport seperti perbaikan sebelumnya (`overflow-x: hidden`).

**Desktop:** jangan sekadar melebarkan layout mobile.
- Beranda: hero + rail kategori + grid 4–5 kolom, keranjang sebagai panel samping (drawer kanan).
- Tracking: layout 2 kolom — peta besar kiri, timeline & kartu driver kanan.
- Admin/Vendor: sidebar + tabel padat, pintasan keyboard, filter tersimpan.

**Rasa & gerak:**
- Animasi mikro Framer Motion (transisi halaman, status berubah, motor bergerak halus dengan interpolasi antar titik GPS).
- Palet konsisten dengan tema `#0B1E36`, aksen hangat, mode gelap opsional.
- Empty state ramah, ilustrasi ringan, teks Bahasa Indonesia santai namun jelas.
- Halaman pembayaran & tracking harus menenangkan: selalu tampilkan "apa selanjutnya" dan estimasi waktu.
- Aksesibilitas: kontras cukup, label ARIA, dukung `prefers-reduced-motion`.
- Performa target: LCP < 2,5 dtk di 4G, gambar WebP + lazy-load, peta dimuat dinamis (`next/dynamic`, tanpa SSR).

---

## 14. Kriteria Penerimaan Akhir (Checklist)

- [ ] Pelanggan dapat mendeteksi/memilih lokasi dan melihat estimasi ongkir sebelum bayar
- [ ] Alamat Lubuk Buaya otomatis ke Hub Lubuk Buaya; override admin berfungsi
- [ ] Admin bisa tambah/edit/nonaktifkan hub, area, produk hub, tarif
- [ ] Pembayaran hanya bisa diverifikasi admin; ada jejak audit
- [ ] Invoice profesional (web, print A4, PDF, QR, WA) & kuitansi & SPK
- [ ] Vendor & driver punya portal terpisah dengan akses terbatas (RLS teruji)
- [ ] Pelanggan melihat posisi driver live di peta + ETA; fallback polling jalan
- [ ] Semua layanan eksternal punya fallback; mematikan satu layanan tidak merusak alur pesanan
- [ ] Tidak ada biaya berjalan pada konfigurasi default
- [ ] `tsc` 0 error, `next build` sukses, uji 375px & 1440px lolos
- [ ] Fitur lama (katalog, keranjang, mockup, PWA, dispatcher, SW cache) tetap berfungsi

---

## 15. Perintah Siap Pakai untuk AI Agent

> "Baca `UPDATE_BLUEPRINT_V2.md` dan `PROGRESS_REPORT.md`. Kerjakan **Fase 1** saja terlebih dahulu. Pertahankan semua fitur yang sudah ada. Gunakan struktur modul pada Bagian 2, semua API harus gratis, dan setiap integrasi eksternal wajib memakai adapter dengan fallback. Setelah selesai, jalankan `tsc --noEmit` dan `next build`, lalu laporkan file yang diubah dan cara mengujinya. Jangan lanjut ke Fase 2 sebelum saya konfirmasi."

---
*Blueprint V2 — disusun untuk Cetak.inc (BAS Advertising Padang). Asumsi yang perlu Anda konfirmasi: alamat/koordinat Hub Lubuk Buaya, daftar produk yang bisa dibuat tiap hub, tarif ongkir dasar, dan rekening/QRIS yang dipakai admin.*
