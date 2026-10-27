"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Smartphone, MapPin, Mail, MessageCircle, Clock } from "lucide-react";

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
    <footer className="hidden md:block bg-[#0B1E36] text-white pt-10 pb-16 lg:pt-16 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="mb-4 lg:mb-6 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0">
                <Image
                  src="/logo-icon.png"
                  alt="Cetak.inc"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-xl lg:text-2xl tracking-tight leading-none text-white mb-1">
                  Cetak<span className="text-[#00A3E0]">.</span>inc
                </h3>
                <span className="text-[10px] lg:text-xs font-medium tracking-wider text-neutral-400 uppercase">
                  Printing & Advertising Studio
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 text-xs lg:text-sm leading-relaxed max-w-md">
              Solusi percetakan cepat dan presisi untuk spanduk kilat, branding outlet, kemasan UMKM, stiker label, dan merchandise di Kota Padang.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all"
              >
                <MessageCircle size={15} />
                <span>Chat via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs lg:text-sm mb-4 uppercase tracking-wider text-gray-400">
              Menu Navigasi
            </h4>
            <ul className="space-y-2.5 text-xs lg:text-sm font-medium text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/produk" className="hover:text-white transition-colors">
                  Katalog Lengkap
                </Link>
              </li>
              <li>
                <a href="#katalog" className="hover:text-white transition-colors">
                  Kategori Pilihan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-xs lg:text-sm mb-4 uppercase tracking-wider text-gray-400">
              Workshop & Kontak
            </h4>
            <div className="space-y-3 text-gray-300 text-xs leading-relaxed">
              <p className="flex items-start gap-2.5">
                <MapPin className="text-emerald-400 shrink-0 mt-0.5" size={15} />
                <span>{settings["contact.address"] || "Jl. Percetakan Modern No.88, Kota Padang"}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="text-emerald-400 shrink-0" size={15} />
                <span>{settings["contact.hours"] || "Senin - Sabtu: 08:30 - 21:00 WIB"}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Smartphone className="text-emerald-400 shrink-0" size={15} />
                <span>+{cleanWa}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} Cetak.inc — All Rights Reserved.</p>
          <p>Didesain untuk kecepatan dan kemudahan pemesanan langsung.</p>
        </div>
      </div>
    </footer>
  );
}
