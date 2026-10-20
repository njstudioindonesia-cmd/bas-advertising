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
  title: "Pusat Cetak Padang by BAS Advertising",
  description: "Pusat Cetak Padang by BAS Advertising - Premium printing & advertising studio delivering precision and perfection.",
  openGraph: {
    title: "Pusat Cetak Padang by BAS Advertising",
    description: "Spesialis cetak premium: Banner, Signage, Stiker, Kartu Nama, dan Custom Print.",
    url: "https://pusatcetakpadang.com", // Placeholder URL
    siteName: "Pusat Cetak Padang",
    images: [
      {
        url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop", // OG Image
        width: 1200,
        height: 630,
        alt: "Workshop Pusat Cetak Padang by BAS Advertising",
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
    "name": "Pusat Cetak Padang by BAS Advertising",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop",
    "description": "Premium printing & advertising studio di Padang. Melayani cetak banner, neon box, stiker, dan custom packaging.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Percetakan Modern No.88",
      "addressLocality": "Jakarta Selatan", // Nanti diganti sesuai kota klien (Padang)
      "addressRegion": "DKI Jakarta",
      "postalCode": "12345",
      "addressCountry": "ID"
    },
    "telephone": "+6281234567890",
    "priceRange": "$$",
    "url": "https://pusatcetakpadang.com"
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
