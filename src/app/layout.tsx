import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0B1E36",
};

export const metadata: Metadata = {
  title: "Cetak.inc — Percetakan & Advertising Studio Modern",
  description: "Cetak.inc — Solusi cetak cepat dan presisi untuk branding outlet, packaging UMKM, merchandise, dan advertising.",
  openGraph: {
    title: "Cetak.inc — Percetakan & Advertising Studio Modern",
    description: "Spesialis cetak premium: Banner, Signage, Stiker, Kartu Nama, dan Custom Print.",
    url: "https://cetakinc.com",
    siteName: "Cetak.inc",
    images: [
      {
        url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop", // OG Image
        width: 1200,
        height: 630,
        alt: "Workshop Cetak.inc Studio Modern",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Structured Data (JSON-LD) untuk LocalBusiness / Printing Service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cetak.inc — Percetakan & Advertising Studio",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop",
    "description": "Premium printing & advertising studio modern. Melayani cetak banner, neon box, stiker, dan custom packaging.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Percetakan Modern No.88",
      "addressLocality": "Kota Padang",
      "addressRegion": "Sumatera Barat",
      "postalCode": "25111",
      "addressCountry": "ID"
    },
    "telephone": "+6281234567890",
    "priceRange": "$$",
    "url": "https://cetakinc.com"
  };

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className="h-full antialiased scroll-smooth"
    >
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900 selection:bg-brand-accent selection:text-white">
        <CartProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Navbar />
          <main className="flex-grow flex flex-col pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <Footer />
          <CartDrawer />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
