import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cetak.inc — Percetakan Cepat Padang",
    short_name: "Cetak.inc",
    description: "Solusi cetak cepat dan presisi untuk branding outlet, packaging UMKM, merchandise, spanduk, dan advertising.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0B1E36",
    orientation: "portrait",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Katalog Produk",
        short_name: "Katalog",
        description: "Lihat seluruh produk percetakan Cetak.inc",
        url: "/produk",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Lacak Pesanan",
        short_name: "Lacak",
        description: "Cek status pengerjaan pesanan cetak",
        url: "/lacak",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Keranjang Belanja",
        short_name: "Keranjang",
        description: "Lihat daftar cetakan di keranjang",
        url: "/keranjang",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
