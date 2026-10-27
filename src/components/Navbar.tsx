"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, MapPin, MessageCircle } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<Record<string, any>>({
    "location.chipLabel": "Kota Padang & Sekitarnya",
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header className="fixed top-0 z-50 w-full flex flex-col items-center pointer-events-none">
      {/* ========================================================= */}
      {/* 📱 MOBILE HEADER BAR - ULTRA-MODERN UNIFIED ROW           */}
      {/* ========================================================= */}
      <div className="md:hidden w-full pointer-events-auto bg-white/85 backdrop-blur-2xl border-b border-neutral-200/60 shadow-[0_1px_12px_rgba(0,0,0,0.02)] pt-safe transition-all">
        <div className="flex items-center justify-between gap-3 px-4 h-14 max-w-lg mx-auto">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative w-8 h-8 rounded-xl bg-white border border-neutral-200/80 p-0.5 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center group-active:scale-90 transition-transform">
              <Image
                src="/logo-icon.png"
                alt="Cetak.inc"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-neutral-950 leading-none">
              Cetak<span className="text-[#00A3E0]">.</span>inc
            </span>
          </Link>

          {/* Integrated Modern Search Capsule */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-[210px] sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search size={14} strokeWidth={2.2} />
            </div>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white text-xs font-normal rounded-full border border-neutral-200/70 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-700"
              >
                <X size={13} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💻 DESKTOP FLOATING PILL NAVBAR - MODERN & CLEAN          */}
      {/* ========================================================= */}
      <div className="hidden md:block w-full max-w-5xl mx-auto px-4 pt-4 pointer-events-auto">
        <nav
          className={`w-full transition-all duration-300 bg-white/85 backdrop-blur-xl border border-neutral-200/80 rounded-full px-5 py-2.5 shadow-lg shadow-neutral-900/5 flex items-center justify-between ${
            scrolled ? "bg-white/95 border-neutral-300 shadow-md py-2" : ""
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-8 h-8 rounded-xl bg-white border border-neutral-200/80 p-1 shadow-2xs group-hover:border-neutral-400 transition-colors flex items-center justify-center shrink-0">
              <Image
                src="/logo-icon.png"
                alt="Cetak.inc"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-neutral-900 leading-none">
              Cetak<span className="text-[#00A3E0]">.</span>inc
            </span>
          </Link>

          {/* Segmented Pill Menu */}
          <div className="flex items-center gap-1 font-medium text-xs text-neutral-600 bg-neutral-100/80 p-1 rounded-full border border-neutral-200/60">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname === "/" ? "bg-white text-neutral-900 shadow-2xs font-semibold" : "hover:text-neutral-900"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/produk"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname === "/produk" ? "bg-white text-neutral-900 shadow-2xs font-semibold" : "hover:text-neutral-900"
              }`}
            >
              Katalog Produk
            </Link>
            <a
              href="/#katalog"
              className="px-4 py-1.5 rounded-full hover:text-neutral-900 transition-all"
            >
              Kategori
            </a>
          </div>

          {/* Right Action: WhatsApp CTA */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya ingin konsultasi pemesanan cetak.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all active:scale-95 shrink-0"
            >
              <MessageCircle size={13} className="text-emerald-400 fill-emerald-400/20" />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
