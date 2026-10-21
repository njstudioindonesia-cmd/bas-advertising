"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Smartphone, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.address": "Jl. Percetakan Modern No.88, Kota Padang, Sumatera Barat",
    "contact.whatsapp": "6281234567890",
    "contact.email": "hello@basadvertising.com",
    "contact.hours": "Senin - Sabtu: 08:30 - 21:00 WIB",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/urang-dalam-bas-adv") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="hidden md:block bg-[#0B1E36] text-white pt-10 pb-24 lg:pt-20 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-16 mb-8 lg:mb-16">
          {/* Brand Info */}
          <div className="md:col-span-1">
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
                <span className="text-[10px] lg:text-xs font-semibold tracking-wider text-[#F97316] uppercase">
                  Printing & Advertising
                </span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 lg:mb-8 text-xs lg:text-sm leading-relaxed text-balance">
              Premium printing & advertising studio delivering precision and perfection for modern brands.
            </p>
            <div className="flex gap-4">
              <a 
                href={`https://wa.me/${String(settings["contact.whatsapp"] || "6281234567890").replace(/[^0-9]/g, "")}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Smartphone size={18} />
              </a>
              <a 
                href={`mailto:${settings["contact.email"] || "hello@basadvertising.com"}`} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider text-gray-500">Navigation</h4>
            <ul className="space-y-3 lg:space-y-4 text-xs lg:text-sm font-medium text-gray-300">
              <li><Link href="/" className="hover:text-[#F97316] transition-colors flex items-center gap-2">Home</Link></li>
              <li><Link href="/about" className="hover:text-[#F97316] transition-colors flex items-center gap-2">About Us</Link></li>
              <li><Link href="/produk" className="hover:text-[#F97316] transition-colors flex items-center gap-2">Katalog Produk</Link></li>
              <li><Link href="/keranjang" className="hover:text-[#F97316] transition-colors flex items-center gap-2">Keranjang Belanja</Link></li>
              <li><Link href="/mockup" className="hover:text-[#F97316] transition-colors flex items-center gap-2">Studio Mockup</Link></li>
              <li><Link href="/portofolio" className="hover:text-[#F97316] transition-colors flex items-center gap-2">Portfolio</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-xs lg:text-sm mb-4 lg:mb-6 uppercase tracking-wider text-gray-500">Contact Us</h4>
            <div className="space-y-4 lg:space-y-6 text-gray-300 text-xs lg:text-sm">
              <p className="flex items-start gap-3 lg:gap-4">
                <MapPin className="text-gray-500 shrink-0 mt-0.5" size={16} />
                <span className="leading-relaxed">{settings["contact.address"] || "Jl. Percetakan Modern No.88, Kota Padang, Sumatera Barat"}</span>
              </p>
              <p className="flex items-center gap-3 lg:gap-4">
                <Phone className="text-gray-500 shrink-0" size={16} />
                <span>+{settings["contact.whatsapp"] || "62 812 3456 7890"}</span>
              </p>
              <p className="flex items-center gap-3 lg:gap-4">
                <Mail className="text-gray-500 shrink-0" size={16} />
                <span>{settings["contact.email"] || "hello@basadvertising.com"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] lg:text-xs text-gray-500">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Cetak.inc — Modern Printing & Advertising Studio. All rights reserved.</p>
          <div className="flex gap-6 items-center">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/urang-dalam-bas-adv" className="text-gray-600 hover:text-amber-400 text-[10px] transition-colors font-medium">
              Urang Dalam BAS ADV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
