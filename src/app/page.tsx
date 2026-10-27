"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle, 
  ShieldCheck, 
  Truck, 
  Award, 
  Search, 
  Zap, 
  Store, 
  Package, 
  Shirt, 
  FileText, 
  Sparkles, 
  Flame, 
  Clock, 
  MessageCircle, 
  Layers
} from "lucide-react";

import QuickProductCard from "@/components/QuickProductCard";
import ProductBottomSheet from "@/components/ProductBottomSheet";

export default function Home() {
  const [productList, setProductList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetProduct, setSheetProduct] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [homeCategory, setHomeCategory] = useState<string>("Semua");
  const [whatsappNumber, setWhatsappNumber] = useState("6282172725267");
  const router = useRouter();

  useEffect(() => {
    const loadData = () => {
      const ts = Date.now();
      Promise.all([
        fetch(`/api/products?t=${ts}`, { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/categories?t=${ts}`, { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/banners?t=${ts}`, { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`/api/settings?t=${ts}`, { cache: "no-store" }).then(r => r.json()).catch(() => ({ data: {} })),
      ]).then(([prodRes, catRes, banRes, setRes]) => {
        if (prodRes?.success && Array.isArray(prodRes.data)) {
          setProductList(prodRes.data);
        }
        if (catRes?.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (banRes?.success && Array.isArray(banRes.data)) {
          setBanners(banRes.data);
        }
        if (setRes?.success && setRes.data && setRes.data["contact.whatsapp"]) {
          setWhatsappNumber(String(setRes.data["contact.whatsapp"]).replace(/[^0-9]/g, ""));
        }
        setLoading(false);
      });
    };

    loadData();

    // Listen for catalog updates from admin broadcast or local storage
    const handleUpdate = () => loadData();
    window.addEventListener("bas_products_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "bas_catalog_version") loadData();
    });

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("bas_catalog_sync");
      bc.onmessage = () => loadData();
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("bas_products_updated", handleUpdate);
      if (bc) {
        try {
          bc.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  let cleanWa = whatsappNumber;
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  const bestSellers = productList.filter(p => p.isBestSeller);
  const recommendedList = bestSellers.length > 0 ? bestSellers : productList;
  // Filter feed produk di halaman Home
  const displayFeed = productList.filter((p) => {
    if (homeCategory === "Semua") return true;
    return (
      p.category === homeCategory ||
      p.categoryId === homeCategory ||
      (p.category && p.category.toLowerCase().includes(homeCategory.toLowerCase()))
    );
  });

  return (
    <div className="bg-white min-h-screen pt-16 sm:pt-20 md:pt-28 pb-20 md:pb-24">
      {/* ======================================================== */}
      {/* 📱 MOBILE APP HOME EXPERIENCE (VISUAL-FIRST & MODERN)     */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-6 px-4 max-w-lg mx-auto">
        {/* 1. IMMERSIVE VISUAL HERO BANNER SLIDER */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1">
            {loading ? (
              <div className="min-w-full aspect-[16/9] rounded-3xl bg-neutral-100 animate-pulse" />
            ) : banners.length > 0 ? (
              banners
                .filter((b) => b.isActive !== false)
                .map((b, idx) => {
                  const imgUrl = b.imageUrl || b.image_url;
                  return (
                    <Link
                      key={b.id || idx}
                      href={b.ctaHref || b.cta_href || "/produk"}
                      className="min-w-full snap-center relative aspect-[16/9] rounded-3xl overflow-hidden shadow-sm group active:scale-[0.99] transition-transform block"
                    >
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={b.title}
                          fill
                          priority={idx === 0}
                          sizes="(max-width: 640px) 100vw, 400px"
                          unoptimized={Boolean(imgUrl.startsWith("data:"))}
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-900" />
                      )}

                      {/* Smooth cinematic gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400 mb-1">
                          Layanan Pilihan
                        </span>
                        <h2 className="text-white font-extrabold text-lg sm:text-xl leading-tight line-clamp-2">
                          {b.title}
                        </h2>
                        {b.subtitle && (
                          <p className="text-white/80 text-xs mt-1 line-clamp-1 font-normal">
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })
            ) : null}
          </div>
        </div>

        {/* 2. VISUAL CATEGORY STORIES (LIVELY & AIRY - NO TEXT CLUTTER) */}
        <div>
          <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1">
            {[
              { id: "all", name: "Semua", categoryName: "Semua", icon: Sparkles },
              { id: "spanduk", name: "Spanduk", categoryName: "Spanduk & Banner", icon: Store },
              { id: "stiker", name: "Stiker", categoryName: "Stiker & Label Kemasan", icon: Layers },
              { id: "kemasan", name: "Packaging", categoryName: "Packaging", icon: Package },
              { id: "merch", name: "Sablon", categoryName: "Merchandise & Sablon", icon: Shirt },
              { id: "signage", name: "Neon Box", categoryName: "Signage & Akrilik", icon: Award },
              { id: "nota", name: "Brosur", categoryName: "Media Promosi & Kantor", icon: FileText },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = homeCategory === cat.categoryName || (cat.categoryName === "Semua" && homeCategory === "Semua");
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setHomeCategory(cat.categoryName);
                    const el = document.getElementById("home-product-feed");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-90 transition-transform"
                >
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/20 scale-105" 
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80"
                  }`}>
                    <Icon size={20} strokeWidth={isSelected ? 2.2 : 1.75} />
                  </div>
                  <span className={`text-[11px] font-medium tracking-tight ${
                    isSelected ? "text-neutral-950 font-bold" : "text-neutral-500"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. VISUAL PRODUCT SHOWCASE FEED (PHOTO-FIRST & SPACIOUS) */}
        <div id="home-product-feed" className="scroll-mt-28 pt-1">
          {/* Minimalist Section Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-extrabold text-base text-neutral-900 tracking-tight">
              {homeCategory === "Semua" ? "Katalog Unggulan" : homeCategory}
            </h3>
            <Link
              href="/produk"
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={13} />
            </Link>
          </div>

          {/* 2-Column Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-neutral-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : displayFeed.length === 0 ? (
            <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-200/60 my-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 text-neutral-600 flex items-center justify-center mx-auto">
                <Package size={22} />
              </div>
              <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto">
                Katalog produk sedang diperbarui. Hubungi kami via WhatsApp untuk konsultasi cetak kustom.
              </p>
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi pemesanan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform"
              >
                <MessageCircle size={14} /> WhatsApp CS
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayFeed.slice(0, 6).map((item) => (
                <QuickProductCard
                  key={item.id}
                  product={item}
                  onOpenDetail={(p) => {
                    setSheetProduct(p);
                    setIsSheetOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* Clean View All Catalog Pill Button */}
          <div className="pt-5 text-center">
            <Link
              href="/produk"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-semibold shadow-xs active:scale-98 transition-all"
            >
              <span>Jelajahi Seluruh Katalog</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 💻 DESKTOP LAYOUT                                       */}
      {/* ======================================================== */}
      <div className="hidden md:block">
        {/* FULL HERO - MODERN MINIMALIST LIGHT STUDIO */}
        <section className="relative w-full overflow-hidden bg-white pt-24 sm:pt-28 md:pt-32 pb-16 lg:pb-20">
          {/* Subtle Atmospheric Light Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-neutral-100/90 via-neutral-50/50 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Centered Typography & Search Unit */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 bg-neutral-100/90 border border-neutral-200/70 px-4 py-1.5 rounded-full text-neutral-700 text-xs font-medium mb-6 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Studio Percetakan & Advertising Modern</span>
            </div>

            {/* Massive Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold tracking-tight text-neutral-900 leading-[1.08] max-w-4xl mx-auto mb-6">
              Cetak Cepat, Presisi & <br />
              <span className="text-neutral-400 font-semibold">
                Kualitas Kebutuhan Bisnis Anda.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-neutral-500 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-normal mb-8">
              Spanduk kilat, label kemasan, seragam crew, merchandise hingga neon box. Pesan langsung via WhatsApp dalam hitungan menit.
            </p>

            {/* Modern Glass Search Capsule */}
            <form onSubmit={handleSearch} className="max-w-2xl w-full mx-auto mb-4 relative z-10">
              <div className="relative flex items-center bg-white border border-neutral-300 hover:border-neutral-400 focus-within:border-neutral-900 focus-within:ring-4 focus-within:ring-neutral-100 rounded-full p-2 shadow-lg shadow-neutral-900/5 transition-all">
                <div className="pl-4 pr-2 text-neutral-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Cari produk... (Contoh: Spanduk, Stiker Label, Box Kemasan)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base py-2.5 px-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none font-normal"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-full transition-colors shadow-2xs shrink-0"
                >
                  Cari Produk
                </button>
              </div>
            </form>

            {/* Quick Search Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-neutral-400 mt-2">
              <span className="font-medium text-neutral-500">Paling dicari:</span>
              {[
                { label: "Spanduk Kilat", q: "Spanduk" },
                { label: "Stiker Label", q: "Stiker" },
                { label: "Box Kemasan", q: "Packaging" },
                { label: "Kaos Sablon", q: "Kaos" },
                { label: "Neon Box", q: "Signage" },
              ].map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag.q);
                    router.push(`/produk?q=${encodeURIComponent(tag.q)}`);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-900 transition-colors text-xs font-medium"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panoramic Full-Width Visual Showcase Banner */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-14">
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-3xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-xl shadow-neutral-900/5 group">
              <Image 
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=2000&auto=format&fit=crop" 
                alt="Workshop percetakan modern Cetak.inc" 
                fill 
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Glass Badges */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm flex items-center gap-1.5">
                <span>⚡</span> Selesai Tepat Waktu
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-xl px-4 py-2 text-xs font-semibold text-neutral-800 shadow-sm flex items-center gap-1.5">
                <span>⭐</span> Garansi Presisi & Cetak Berkualitas
              </div>
            </div>
          </div>

          {/* Integrated Light Trust Strip */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-200/70 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: <Clock size={18} className="text-neutral-700" />, title: "Proses Cepat", desc: "Selesai tepat waktu & presisi." },
              { icon: <ShieldCheck size={18} className="text-neutral-700" />, title: "Pemesanan Instan", desc: "Langsung via WhatsApp tanpa ribet." },
              { icon: <Truck size={18} className="text-neutral-700" />, title: "Pengiriman Cepat", desc: "Layanan kirim kilat & aman ke alamat Anda." },
              { icon: <Award size={18} className="text-neutral-700" />, title: "Kualitas Terjamin", desc: "Bahan bermutu & hasil tajam presisi." }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-200/60 text-neutral-800">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm leading-snug">{feature.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DESKTOP PROMO BANNERS - MINIMALIST & CLEAN SHOWCASE */}
        {banners.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-5 border-b border-neutral-200/60 gap-4">
              <div>
                <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 block mb-1">
                  Layanan Unggulan
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Promo Spesial & Layanan Prioritas
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Solusi cetak cepat dan penawaran terbaik untuk kebutuhan bisnis & personal Anda.
                </p>
              </div>
              <Link 
                href="/produk" 
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
              >
                Katalog Lengkap <ArrowRight size={13} />
              </Link>
            </div>

            {/* 3 Modern Clean Showcase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners
                .filter((b) => b.isActive !== false)
                .slice(0, 3)
                .map((b, idx) => {
                  const imgUrl = b.imageUrl || b.image_url;
                  const targetHref = b.ctaHref || b.cta_href || "/produk";
                  return (
                    <article
                      key={b.id || idx}
                      className="group bg-white rounded-2xl border border-neutral-200/70 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* 🖼️ Crisp Full-Color Photo Container */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                          {imgUrl && (
                            <Image
                              src={imgUrl}
                              alt={b.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 33vw"
                              unoptimized={Boolean(imgUrl.startsWith("data:"))}
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full shadow-2xs">
                              Layanan Pilihan
                            </span>
                          </div>
                        </div>

                        {/* 📄 Clean Typography */}
                        <div className="p-5 sm:p-6">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug group-hover:text-emerald-700 transition-colors">
                            {b.title}
                          </h3>
                          {b.subtitle && (
                            <p className="text-xs sm:text-sm text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                              {b.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 🏷️ Action Footer */}
                      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <Link
                          href={targetHref}
                          className="text-xs font-semibold text-neutral-900 group-hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>{b.ctaLabel || b.cta_label || "Lihat Penawaran"}</span>
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[11px] font-medium text-neutral-400">
                          Cetak.inc
                        </span>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        )}

        {/* UNIFIED MINIMALIST CATALOG SECTION */}
        <section id="katalog" className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20 scroll-mt-28">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-5 border-b border-neutral-200/60 gap-4">
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 block mb-1">
                Katalog Resmi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Pilihan Produk Percetakan & Advertising
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Pilih produk berkualitas dan pesan langsung via WhatsApp dalam hitungan menit.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">
                {displayFeed.length} Produk
              </span>
              <Link 
                href="/produk" 
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors inline-flex items-center gap-1"
              >
                Semua Katalog <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Minimalist Filter Pills - 2 Rows Clean Wrap */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setHomeCategory("Semua")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                homeCategory === "Semua"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Semua <span className="opacity-60 text-[11px] ml-0.5">({productList.length})</span>
            </button>

            {categories
              .filter((c: any) => {
                const cName = typeof c === "string" ? c : c.name;
                const count = productList.filter((p) => p.category === cName || p.categoryId === c.id).length;
                return count > 0;
              })
              .map((c: any) => {
                const rawName = typeof c === "string" ? c : c.name;
                const cName = rawName === "PACKAGING" ? "Packaging" : rawName === "SPANDUK" ? "Spanduk" : rawName === "STIKER" ? "Stiker" : rawName;
                const count = productList.filter((p) => p.category === rawName || p.categoryId === c.id).length;
                const isSelected = homeCategory === rawName;

                return (
                  <button
                    key={c.id || rawName}
                    type="button"
                    onClick={() => setHomeCategory(rawName)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                      isSelected
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900"
                    }`}
                  >
                    {cName} <span className="opacity-60 text-[11px] ml-0.5">({count})</span>
                  </button>
                );
              })}
          </div>

          {/* Minimalist Product Grid (Strictly 2 Rows = 10 Products) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-neutral-100 animate-pulse space-y-3">
                  <div className="aspect-square bg-neutral-100 rounded-xl" />
                  <div className="h-4 bg-neutral-100 rounded w-2/3" />
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : displayFeed.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {displayFeed.slice(0, 10).map((item) => (
                  <QuickProductCard
                    key={item.id}
                    product={item}
                    onOpenDetail={(p) => {
                      setSheetProduct(p);
                      setIsSheetOpen(true);
                    }}
                  />
                ))}
              </div>

              {displayFeed.length > 10 && (
                <div className="text-center mt-10">
                  <Link
                    href={`/produk${homeCategory !== "Semua" ? `?category=${encodeURIComponent(homeCategory)}` : ""}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-xs hover:shadow-md transition-all active:scale-95"
                  >
                    <span>Lihat Semua {displayFeed.length} Produk {homeCategory !== "Semua" ? `Kategori ${homeCategory}` : "Katalog"}</span>
                    <ArrowRight size={14} className="text-neutral-300" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-100 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-600 mx-auto mb-3">
                <Package size={28} />
              </div>
              <h3 className="font-extrabold text-neutral-900 text-base mb-1">Kategori Ini Belum Ada Produk</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Pilih kategori lain atau hubungi CS kami via WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setHomeCategory("Semua")}
                className="px-5 py-2.5 bg-neutral-900 text-white font-semibold rounded-xl text-xs hover:bg-neutral-800 transition-colors"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          )}
        </section>

        {/* B2B & WHATSAPP BANNER */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="bg-gradient-to-br from-[#0B1E36] to-[#1E1B4B] rounded-[2rem] p-8 lg:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-8 justify-between items-center">
            <div className="relative z-10 lg:w-[65%] w-full">
              <div className="inline-block bg-white/10 text-orange-300 font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-4 border border-white/10">
                KONSULTASI & PESAN LANGSUNG
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Punya Kebutuhan Cetak Spesifik?<br />
                <span className="text-[#FBBF24]">Diskusikan Langsung dengan CS Kami</span>
              </h2>
              <p className="text-blue-100 text-sm lg:text-base max-w-xl mb-6 leading-relaxed opacity-90">
                Kirimkan file desain Anda atau konsultasikan spesifikasi ukuran, bahan, dan deadline. Tim Cetak.inc siap membantu dengan cepat.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-blue-50">
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10B981]" /> Pengerjaan Cepat & Rapi</div>
                <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#10B981]" /> Garansi Kualitas Cetak</div>
              </div>
            </div>

            <div className="relative z-10 lg:w-[30%] flex flex-col gap-3 w-full">
              <a 
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya ingin konsultasi cetak dan kirim file.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95"
              >
                <MessageCircle size={20} />
                <span>Chat WhatsApp Sekarang</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* PRODUCT BOTTOM SHEET MODAL */}
      <ProductBottomSheet
        product={sheetProduct}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
