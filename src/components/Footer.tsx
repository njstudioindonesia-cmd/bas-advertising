"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Smartphone, MapPin, Mail, MessageCircle, Clock, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.address": "Jl. Percetakan Modern No.88, Kota Padang, Sumatera Barat",
    "contact.whatsapp": "6282172725267",
    "contact.email": "hello@basadvertising.com",
    "contact.hours": "Senin - Sabtu: 08:30 - 21:00 WIB",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  let cleanWa = String(settings["contact.whatsapp"] || "6282172725267").replace(/[^0-9]/g, "");
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  return (
    <footer className="w-full bg-neutral-50/90 border-t border-neutral-200/70 pt-8 pb-28 md:pt-14 md:pb-12 text-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Banner on Footer */}
        <div className="mb-8 p-4 sm:p-6 rounded-3xl bg-white border border-neutral-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-neutral-900 tracking-tight">
                Punya Kebutuhan Cetak Kustom atau Grosir?
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Konsultasi gratis & hitung estimasi biaya langsung bersama tim kami.
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi pemesanan kustom/grosir.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <MessageCircle size={14} />
            <span>Hubungi WhatsApp</span>
          </a>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-12 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-2xl bg-white border border-neutral-200/80 p-1 shadow-2xs flex items-center justify-center shrink-0">
                <Image
                  src="/logo-icon.png"
                  alt="Cetak.inc"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-neutral-900">
                  Cetak<span className="text-[#00A3E0]">.</span>inc
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase mt-0.5">
                  Printing & Advertising Studio
                </span>
              </div>
            </Link>
            
            <p className="text-neutral-500 text-xs leading-relaxed max-w-md">
              Solusi percetakan modern berkecepatan tinggi di Kota Padang. Melayani spanduk kilat, standing banner, kemasan UMKM, stiker label die-cut, neon box akrilik, dan merchandise premium.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-neutral-600">
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-neutral-200/60 shadow-2xs">
                <ShieldCheck size={12} className="text-emerald-600" /> Garansi Presisi 100%
              </span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-neutral-200/60 shadow-2xs">
                <Clock size={12} className="text-neutral-600" /> Layanan Kilat 24 Jam
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-3">
              Katalog Pilihan
            </h4>
            <ul className="space-y-2 text-xs font-medium text-neutral-600">
              <li>
                <Link href="/produk?category=Spanduk%20%26%20Banner" className="hover:text-neutral-950 transition-colors">
                  Spanduk & Banner Outdoor
                </Link>
              </li>
              <li>
                <Link href="/produk?category=Packaging" className="hover:text-neutral-950 transition-colors">
                  Packaging & Kemasan Box
                </Link>
              </li>
              <li>
                <Link href="/produk?category=Stiker%20%26%20Label%20Kemasan" className="hover:text-neutral-950 transition-colors">
                  Stiker Vinyl & Label A3+
                </Link>
              </li>
              <li>
                <Link href="/produk?category=Signage%20%26%20Akrilik" className="hover:text-neutral-950 transition-colors">
                  Neon Box & Huruf Timbul
                </Link>
              </li>
              <li>
                <Link href="/produk" className="hover:text-neutral-950 transition-colors inline-flex items-center gap-1 text-emerald-600 font-semibold pt-0.5">
                  Semua Produk <ArrowRight size={11} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Workshop */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-3">
              Workshop & Kontak
            </h4>
            <div className="space-y-2 text-neutral-600 text-xs leading-relaxed">
              <p className="flex items-start gap-2">
                <MapPin className="text-neutral-500 shrink-0 mt-0.5" size={14} />
                <span>{settings["contact.address"] || "Jl. Percetakan Modern No.88, Kota Padang"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="text-neutral-500 shrink-0" size={14} />
                <span>{settings["contact.hours"] || "Senin - Sabtu: 08:30 - 21:00 WIB"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Smartphone className="text-emerald-600 shrink-0" size={14} />
                <span className="font-semibold text-neutral-900">+{cleanWa}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal */}
        <div className="border-t border-neutral-200/70 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Cetak.inc. All Rights Reserved. Kota Padang, Sumatera Barat.</p>
          <p>Didesain untuk kecepatan dan kemudahan pemesanan langsung.</p>
        </div>

      </div>
    </footer>
  );
}
