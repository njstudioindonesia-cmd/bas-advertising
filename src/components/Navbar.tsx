"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Printer, Zap, X, MapPin, MessageCircle, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen, isLoaded } = useCart();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromo, setShowPromo] = useState(true);
  const [settings, setSettings] = useState<Record<string, any>>({
    "contact.whatsapp": "6281234567890",
    "location.chipLabel": "Kota Padang & Sekitarnya",
    "home.promoTitle": "Diskon 25%",
    "home.promoSubtitle": "untuk Branding Cafe & Resto",
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

  // Hide on admin portal
  if (pathname?.startsWith("/urang-dalam-bas-adv") || pathname?.startsWith("/admin")) {
    return null;
  }

  const cleanWaNumber = String(settings["contact.whatsapp"] || "6281234567890").replace(/[^0-9]/g, "");

  return (
    <header className="fixed top-0 z-50 w-full flex flex-col items-center">
      
      {/* ========================================================= */}
      {/* 📱 MOBILE APP TOP BAR (NATIVE APP EXPERIENCE FOR MOBILE) */}
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
              <span className="font-display font-black text-[16px] tracking-tight text-[#0B1E36] leading-none truncate">
                Cetak.inc
              </span>
              <span className="text-[9px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={9} className="text-[#F97316] shrink-0" />
                <span className="truncate">{settings["location.chipLabel"] || "Kota Padang & Sekitarnya"}</span>
              </span>
            </div>
          </Link>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* WhatsApp Direct */}
            <a
              href={`https://wa.me/${cleanWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat WhatsApp"
              className="w-8 h-8 rounded-full bg-green-50 text-[#25D366] flex items-center justify-center active:scale-95 transition-transform"
            >
              <MessageCircle size={17} />
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Keranjang Belanja"
              className="relative w-8 h-8 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center active:scale-95 transition-transform"
            >
              <ShoppingCart size={17} />
              {isLoaded && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-extrabold min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="px-3 pb-2.5">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Cari produk cetak, cup, jersey, spanduk..."
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
      {/* 💻 DESKTOP NAVBAR */}
      {/* ========================================================= */}
      <nav className={`hidden md:block w-full transition-all duration-300 bg-white border-b border-gray-100 relative z-20 ${scrolled ? 'shadow-sm py-2.5' : 'py-4'}`}>
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
                <span className="font-display font-black text-2xl tracking-tight text-[#0B1E36] leading-none mb-0.5">
                  Cetak.inc
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#F97316] uppercase">
                  Printing & Advertising Studio
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="flex items-center gap-8 font-medium text-sm text-gray-600">
              <Link href="/" className="hover:text-[#F97316] transition-colors">Beranda</Link>
              <Link href="/produk" className="hover:text-[#F97316] transition-colors">Semua Produk</Link>
              <Link href="/mockup" className="hover:text-[#F97316] transition-colors flex items-center gap-1.5">
                <Palette size={15} className="text-[#F97316]" /> Studio Mockup
              </Link>
              <Link href="/portofolio" className="hover:text-[#F97316] transition-colors">Portofolio</Link>
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-[#0B1E36] hover:text-[#F97316] transition-colors relative flex items-center justify-center p-2 rounded-xl hover:bg-gray-50"
                title="Buka Keranjang Belanja"
                aria-label="Keranjang Belanja"
              >
                <ShoppingCart size={22} />
                {isLoaded && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
              <a
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F97316] hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm shadow-sm inline-flex items-center gap-1.5"
              >
                <MessageCircle size={15} /> Hubungi Kami
              </a>
            </div>

          </div>
        </div>
      </nav>

      {/* FLOATING PROMO BANNER (DESKTOP ONLY) */}
      <AnimatePresence>
        {showPromo && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`hidden md:flex fixed w-full z-10 justify-center pointer-events-none px-4 transition-all duration-300 ${scrolled ? 'top-[68px]' : 'top-[84px]'}`}
          >
            <div className="pointer-events-auto bg-gradient-to-r from-[#F97316] to-[#F59E0B] rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xl shadow-[#F97316]/20 border border-orange-400/40">
              <div className="flex items-center gap-1.5 text-white font-medium text-xs">
                <Zap size={14} fill="currentColor" className="shrink-0 animate-pulse" />
                <span><strong className="font-bold">{settings["home.promoTitle"] || "Diskon 25%"}</strong> {settings["home.promoSubtitle"] || "untuk Branding Cafe & Resto"}</span>
              </div>
              
              <div className="flex items-center gap-2 border-l border-white/30 pl-3">
                <Link href="/produk" className="text-[#F97316] text-[10px] font-bold bg-white px-2.5 py-0.5 rounded-full hover:bg-gray-50 transition-colors shadow-2xs">
                  KLAIM
                </Link>
                <button 
                  onClick={() => setShowPromo(false)}
                  className="text-white hover:bg-white/20 p-0.5 rounded-full transition-colors"
                  aria-label="Tutup promo"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
