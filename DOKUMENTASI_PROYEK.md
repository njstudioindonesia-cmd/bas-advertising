# 📘 DOKUMENTASI PROYEK: CETAK.INC by BAS ADVERTISING
*Dokumentasi Lengkap Fitur, Arsitektur, Katalog Produk, E-Commerce, dan Portal Urang Dalam*

---

## 📌 1. Ringkasan Proyek

| Informasi | Detail |
| :--- | :--- |
| **Nama Aplikasi** | Cetak.inc — Modern Printing & Advertising Studio |
| **Fokus Layanan** | Percetakan, Digital Printing, Apparel, Signage & Merchandise Usaha |
| **Teknologi Utama** | Next.js 16.3.1 (Turbopack, App Router), React 19, Tailwind CSS v4, TypeScript |
| **Animasi & Ikon** | Framer Motion, Lucide Icons |
| **Penyimpanan Data** | Local JSON File Engine (`src/data/products.json` & `src/lib/products-store.ts`) |
| **State Keranjang** | React Context + LocalStorage (`bas_cart`) |
| **Integrasi Checkout** | Direct Structured WhatsApp API (`+62 812-3456-7890`) |
| **Portal Admin Khusus** | `/urang-dalam-bas-adv` (Password-protected) |

---

## 🏗️ 2. Arsitektur & Struktur Direktori

```text
d:\AI DEV\BAS ADVERTISING\
├── public/
│   └── images/
│       ├── branding/              # Mockup eksklusif (Cup, Meja, Packaging, dll)
│       └── ...                    # Aset grafis pendukung
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── products/
│   │   │       ├── route.ts       # Endpoint CRUD Produk (GET, POST, PUT, DELETE, Reset)
│   │   │       └── [id]/route.ts  # Endpoint Detail Produk per ID
│   │   ├── urang-dalam-bas-adv/   # 🔐 PORTAL KHUSUS ADMIN (Terpisah)
│   │   │   └── page.tsx           # Dashboard Manajemen Produk & Harga
│   │   ├── admin/
│   │   │   └── page.tsx           # Redirect otomatis (307) ke /urang-dalam-bas-adv
│   │   ├── produk/
│   │   │   ├── page.tsx           # Katalog Produk (Filter Kategori Horizontal, Pencarian)
│   │   │   └── [id]/page.tsx      # Detail Produk + Sticky Mobile Action Bar
│   │   ├── keranjang/
│   │   │   └── page.tsx           # Halaman Keranjang & Formulir Checkout WhatsApp
│   │   ├── mockup/
│   │   │   └── page.tsx           # Studio Mockup Visualisasi 3D Interaktif
│   │   ├── portofolio/
│   │   │   └── page.tsx           # Galeri Portofolio Proyek Terpilih
│   │   ├── about/
│   │   │   └── page.tsx           # Profil Studio BAS Advertising
│   │   ├── hubungi/
│   │   │   └── page.tsx           # Kontak & Lokasi Workshop Padang
│   │   ├── globals.css            # Utilitas Safe-Area, No-Scrollbar & Touch Manipulation
│   │   ├── layout.tsx             # Root Layout (CartProvider, Drawer, BottomNav, Viewport)
│   │   └── page.tsx               # Homepage Mobile Super-App & Desktop Hero
│   ├── components/
│   │   ├── Navbar.tsx             # Header Mobile App Bar + Desktop Header
│   │   ├── BottomNav.tsx          # Bilah Tab Bawah Khusus Pelanggan (5 Tab)
│   │   ├── CartDrawer.tsx         # Slide-Over Cart Drawer & WhatsApp Order Flow
│   │   ├── ProductDetailActions.tsx # Stepper Kuantitas + Tombol Floating Mobile
│   │   └── Footer.tsx             # Navigasi Bawah & Link Tersembunyi Urang Dalam
│   ├── context/
│   │   └── CartContext.tsx        # State Management Keranjang Belanja
│   ├── data/
│   │   ├── products.ts            # Data master default 89 produk cetak & merch
│   │   └── products.json          # File database live yang dibaca & diubah admin
│   └── lib/
│       └── products-store.ts      # Engine persistensi data server-side
```

---

## 📦 3. Katalog Produk Lengkap (89 Produk Aktif)

Semua produk telah dipetakan rapi ke dalam 8 kategori checklist kebutuhan cetak & branding bisnis:

### A. Branding Outlet (9 Produk)
1. Sticker Kaca / Window Sticker (One Way & Sandblast)
2. Sticker Pintu (Vinyl Waterproof + Doft/Glossy)
3. Wall Sticker / Wall Graphic Cafe
4. Standing Banner / X-Banner Display
5. Banner Event Promosi
6. Signage Toilet Akrilik
7. Signage Smoking Area
8. Signage Direction / Wayfinding
9. Notice Board / Papan Pengumuman Kayu & Akrilik

### B. Branding Meja (7 Produk)
1. Table Number Akrilik & Kayu Custom
2. Table Tent Akrilik Display Menu
3. Menu Cetak Laminasi Anti Air
4. Coaster / Tatakan Gelas Karet & Gabus
5. Tissue Paper Sleeve / Bungkus Tisu Custom
6. QR Menu Card Akrilik Scan Meja
7. Loyalty Card Stamp Pelanggan

### C. Packaging Makanan & Minuman (14 Produk)
1. Paper Cup Kopi Panas 8oz / 12oz
2. Plastic Cup Sablon Minuman Dingin 16oz
3. Cup Sleeve Kertas Anti Panas
4. Cup Sticker Transparan
5. Cup Lid Sticker / Stiker Tutup Cup
6. Paper Bag Kraft Cokelat / Putih
7. Food Paper Bag / Kantong Roti & Pastry
8. Food Box Takeaway Kraft Anti Minyak
9. Cake Box Premium Jendela Mika
10. Bottle Label Sticker Vinyl
11. Cold Brew Bottle Label
12. Coffee Bean Bag Valve Alumunium Foil
13. Sticker Seal / Stiker Segel Kemasan
14. Thank-You Card / Kartu Ucapan

### D. Crew Uniform & ID (6 Produk)
1. T-Shirt Kaos Crew Barista Cotton Combed 24s
2. Hoodie / Jacket Crew Fleence Tebal
3. Apron Barista Canvas & Kulit Sintetis
4. Name Tag Akrilik Magnet
5. ID Card Karyawan PVC Tebal
6. Lanyard Tali Gantungan ID Printing

### E. Marketing & Promosi (11 Produk)
1. Flyer Promosi Full Color Art Paper
2. Brosur Lipat 3 Art Carton
3. Voucher Belanja Diskon
4. Discount Card Promo
5. Membership Card VIP
6. Loyalty Stamp Card Tebal
7. Event Ticket / Tiket Masuk Berporporasi
8. Undangan VIP Event Pembukaan
9. Poster Launching Menu Baru
10. Poster Seasonal Menu A3+
11. Sticker Pack Die Cut Hologram

### F. Barang Cetak Pendukung / Kantor (8 Produk)
1. Nota NCR / Receipt Kasir Rangkap
2. Kop Surat Perusahaan HVS
3. Amplop Kop Surat Custom
4. Business Card / Kartu Nama Premium
5. Staff Card ID Card
6. Paper Placemat / Alas Piring Kertas
7. Tray Liner / Kertas Alas Nampan
8. Tissue Holder Insert Acrylic

### G. Merchandise & Aksesoris (29 Produk)
1. T-Shirt Merchandise Eksklusif
2. Hoodie Merchandise Katun Fleece
3. Tote Bag Kanvas Blacu Premium
4. Cap / Topi Baseball Custom Bordir
5. Mug Keramik Custom Sablon
6. Tumbler Stainless Steel Grafir Laser
7. Glass / Gelas Kaca Kafe Custom Logo
8. Keychain / Gantungan Kunci Akrilik & Karet
9. Pin / Enamel Pin Logam
10. Sticker Pack Merchandise Vinyl UV
11. Notebook Hardcover Jilid Jahit
12. Coffee Bean Merchandise Kemasan Ritel
13. Ikat Rambut / Scrunchie Custom Kain
14. Sendal Slipper Karet / Hotel Slide
15. Jas Hujan Custom Logo
16. Sapu Tangan Katun Lembut
17. Tray Ice Cube Silikon Cetakan Es
18. Pemantik Api / Korek Gas Grafir Zippo Style
19. Jedai / Jepit Rambut Wanita Custom
20. Cardholder Dompet Kartu Kulit Sintetis
21. Jam Dinding Cafe Minimalis Custom
22. Bantal Tangan Kantor / Sofa Kafe
23. Selimut Lembut Polar Fleece Travel
24. Handuk Kecil Jogging Microfiber
25. Pouch Makeup Perempuan Kanvas
26. Topi Bucket Hat Custom Sablon
27. Kaos Kaki Rajut Jacquard
28. Mousepad Meja Kerja Jahit Tepi
29. Asbak Rokok Melamin / Kaca Cafe

### H. Outdoor & Signage (5 Produk)
1. Spanduk Flexi Korea 440gsm High-Res
2. Baliho / Billboard Event Rangka Besi
3. Neon Box Akrilik LED Bulat & Persegi
4. Huruf Timbul Stainless & Akrilik Menyala
5. Umbul-Umbul Kain Sublimasi

---

## 🛒 4. Sistem E-Commerce & Checkout WhatsApp

1. **State Management (`CartContext.tsx`)**:
   * Menyimpan data keranjang dalam `localStorage` (`bas_cart`).
   * Sinkronisasi jumlah kuantitas, catatan desain khusus (*Google Drive link* / *request ukuran*), dan format Rupiah otomatis.
2. **2 Mode Tampilan Keranjang**:
   * **Slide-over Drawer (`CartDrawer.tsx`)**: Meluncur mulus dari kanan layar saat menekan ikon keranjang di bilah navigasi.
   * **Halaman Mandiri (`/keranjang`)**: Halaman checkout penuh dengan kontrol daftar produk yang responsif.
3. **Formulir Checkout Lengkap**:
   * Nama Pembeli & Nomor WhatsApp aktif.
   * Opsi Pengiriman: *Kirim ke Alamat* vs *Ambil di Workshop/Toko*.
   * Metode Pembayaran: *QRIS Instant*, *Transfer Bank (BCA / Mandiri)*, atau *Bayar di Tempat (COD / Kasir Toko)*.
   * Catatan Tambahan / Tautan Desain Canva/Drive.
4. **Generator Faktur Otomatis WhatsApp**:
   * Memformat data belanja menjadi pesan teks WhatsApp resmi yang rapi dan terstruktur, lalu langsung mengarahkan pengguna ke percakapan nomor WhatsApp tim BAS Advertising (`+62 812-3456-7890`).

---

## 📱 5. Tampilan Responsif Mobile Portrait (Gaya Native Mobile App)

Halaman web telah dioptimalkan secara mendalam untuk resolusi layar portrait ponsel pintar (360px - 430px):

1. **Top Mobile App Bar (`Navbar.tsx`)**:
   * Pinned sticky di bagian atas dengan safe-area padding (`pt-safe`).
   * Chip lokasi aktif: `📍 Kota Padang & Sekitarnya`.
   * Kolom pencarian terintegrasi dengan tombol *clear* cepat.
   * Tombol WhatsApp langsung dan Keranjang dengan badge menyala.
2. **Bilah Tab Bawah (`BottomNav.tsx`)**:
   * Desain *frosted glass* (`backdrop-blur-xl`) dengan 5 tab belanja:
     * 🏠 **Beranda**
     * 🗂️ **Katalog**
     * 🎨 **Mockup**
     * 💼 **Portofolio**
     * 🛒 **Keranjang** (disertai live badge counter)
   * Dilengkapi indikator bar oranye di atas tab aktif dan respons haptik sentuhan.
3. **Beranda Super-App (`page.tsx`)**:
   * **Carousel Banner Geser**: 3 banner promosi horizontal (*snap-scroll*).
   * **Grid 8 Ikon Kategori Cepat (4x2)**: Ikon bundar bernuansa aplikasi mobile e-commerce (*Outlet, Meja, Kemasan, Crew, Promosi, Kantor, Merchandise, Studio 3D*).
   * **Flash Deals / Paling Laris Rail**: List produk mendatar dengan tombol cepat `+ Keranjang`.
   * **Feed 2-Kolom E-Commerce**: Kartu produk proporsional 1:1, label diskon, rating, dan tombol aksi satu sentuhan.
4. **Katalog Produk (`/produk`)**:
   * Chip kategori mendatar (*horizontal swipeable chips*) yang dapat digeser santai dengan jempol tanpa membuat layar penuh.
5. **Detail Produk (`/produk/[id]`)**:
   * **Sticky Bottom Action Bar**: Bilah aksi melayang di atas bilah navigasi HP berisi tombol `+ Keranjang` dan `Beli via WA` yang selalu dapat dijangkau jempol dari posisi gulir mana pun.

---

## 🔐 6. Portal Khusus: "Urang Dalam BAS ADV"

Akses admin telah **dipisahkan secara mandiri** agar tidak tercampur dengan antarmuka pelanggan publik:

* **URL Khusus**: `http://localhost:3000/urang-dalam-bas-adv`
* **Redirect Proteksi**: Akses langsung ke `/admin` otomatis dialihkan (*307 Temporary Redirect*) ke `/urang-dalam-bas-adv`.
* **Kredensial Default**: Password `admin123` atau `bas2026`.
* **Fitur Lengkap Portal Urang Dalam**:
  * Ringkasan metrik statistik produk, kategori, dan produk terlaris.
  * Tambah produk baru dengan pilihan preset gambar produk atau URL custom.
  * Edit judul, kategori, harga jual, harga normal (coret), satuan, deskripsi, dan poin spesifikasi secara langsung.
  * Hapus produk dengan konfirmasi keamanan.
  * Toggle badge status *Best Seller / Terlaris*.
  * Pencarian dan filter kategori real-time.
  * Tombol Reset Database ke default checklist awal.
  * Tampilan responsif ganda: **Mobile Card List View** di HP & **Desktop Table View** di laptop/PC.

---

## 🚀 7. Panduan Menjalankan Web

Untuk menyalakan server pengembangan secara lokal:

```powershell
# Buka PowerShell pada direktori proyek
cd "d:\AI DEV\BAS ADVERTISING"

# Jalankan server Next.js dengan Turbopack
npm run dev
```

* **Akses Browser Lokal**: [http://localhost:3000](http://localhost:3000)
* **Akses Browser Jaringan WiFi**: [http://192.168.1.9:3000](http://192.168.1.9:3000)
* **Portal Urang Dalam**: [http://localhost:3000/urang-dalam-bas-adv](http://localhost:3000/urang-dalam-bas-adv)
