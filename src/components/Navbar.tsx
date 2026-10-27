"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, MapPin } from "lucide-react";

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

  return (
    <header className="fixed top-0 z-50 w-full flex flex-col items-center">
      {/* ========================================================= */}
      {/* 📱 MOBILE HEADER BAR                                      */}
      {/* ========================================================= */}
      <div className="md:hidden w-full bg-white/95 backdrop-blur-md border-b border-gray-100/90 shadow-2xs pt-safe transition-all">
        {/* Top App Header Row */}
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Logo & City Badge */}
          <Link href="/" className="flex items-center gap-2.5 group min-w-0">
            <div className="relative w-8 h-8 rounded-xl bg-white border border-gray-200/80 p-0.5 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center">
              <Image
                src="/logo-icon.png"
                alt="Cetak.inc"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[16px] tracking-tight text-gray-900 leading-none truncate">
                Cetak<span className="text-[#00A3E0]">.</span>inc
              </span>
              <span className="text-[9px] font-medium text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={9} className="text-[#F97316] shrink-0" />
                <span className="truncate">{settings["location.chipLabel"] || "Kota Padang & Sekitarnya"}</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="px-3 pb-2.5">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Cari spanduk, stiker, banner, packaging..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-gray-100/80 focus:bg-white text-xs font-medium rounded-full border border-gray-200/60 focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 💻 DESKTOP NAVBAR                                         */}
      {/* ========================================================= */}
      <nav
        className={`hidden md:block w-full transition-all duration-300 bg-white border-b border-gray-100 relative z-20 ${
          scrolled ? "shadow-sm py-2.5" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-11 h-11 rounded-2xl bg-white border border-gray-200/90 p-1 shadow-2xs group-hover:border-orange-300 transition-colors flex items-center justify-center shrink-0">
                <Image
                  src="/logo-icon.png"
                  alt="Cetak.inc"
                  width={38}
                  height={38}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 leading-none mb-1">
                  Cetak<span className="text-[#00A3E0]">.</span>inc
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#F97316] uppercase">
                  Printing & Advertising Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="flex items-center gap-8 font-semibold text-sm text-gray-600">
              <Link href="/" className="hover:text-[#F97316] transition-colors">
                Beranda
              </Link>
              <Link href="/produk" className="hover:text-[#F97316] transition-colors">
                Katalog Produk
              </Link>
              <a
                href="#katalog"
                className="hover:text-[#F97316] transition-colors text-xs text-gray-500 bg-gray-100 hover:bg-orange-50 hover:text-[#F97316] px-3.5 py-1.5 rounded-full transition-all"
              >
                Kategori Pilihan
              </a>
            </div>

            {/* Desktop Right: Location & Store Status */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{settings["location.chipLabel"] || "Kota Padang & Sekitarnya"}</span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
