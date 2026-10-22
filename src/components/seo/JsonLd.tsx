export default function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://cetakinc.vercel.app";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PrintShop",
    "name": "Cetak.inc — BAS Advertising Padang",
    "alternateName": "BAS Advertising Padang",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": `${baseUrl}/icon-512.png`,
    "description": "Platform Percetakan Cepat, Berkualitas & Terpercaya di Kota Padang & Sekitarnya. Layanan Spanduk, Stiker, Brosur, Kaos, Neon Box Akrilik, dan Merchandise Bisnis dengan Live Tracking Kurir.",
    "telephone": "+6282283995544",
    "email": "hello@basadvertising.com",
    "priceRange": "Rp 5.000 - Rp 5.000.000",
    "currenciesAccepted": "IDR",
    "paymentAccepted": "Cash, Bank Transfer, QRIS",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Belanti Baru No. 17, Lolong Belanti, Kec. Padang Utara",
      "addressLocality": "Kota Padang",
      "addressRegion": "Sumatera Barat",
      "postalCode": "25136",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -0.9025,
      "longitude": 100.3542
    },
    "areaServed": [
      { "@type": "City", "name": "Kota Padang" },
      { "@type": "City", "name": "Pariaman" },
      { "@type": "City", "name": "Bukittinggi" },
      { "@type": "AdministrativeArea", "name": "Sumatera Barat" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "08:30",
        "closes": "21:00"
      }
    ],
    "department": [
      {
        "@type": "PrintShop",
        "name": "Cetak.inc Hub Lubuk Buaya (Workshop Cabang)",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Adinegoro No. 88, Lubuk Buaya, Kec. Koto Tangah",
          "addressLocality": "Kota Padang",
          "addressRegion": "Sumatera Barat",
          "postalCode": "25586",
          "addressCountry": "ID"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -0.8354,
          "longitude": 100.3150
        },
        "telephone": "+6282283995544"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Layanan Percetakan Digital & Reklame Padang",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cetak Spanduk Flexi & Banner Kilat"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Stiker Vinyl, Cromo & Label Kemasan Produk UMKM"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Brosur, Flyer, Nota & Kop Surat Bisnis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Sablon Kaos DTF & Seragam Komunitas"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Pembuatan Neon Box Akrilik & Plang Toko Padang"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
