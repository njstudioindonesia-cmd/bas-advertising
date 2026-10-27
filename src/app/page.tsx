"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Award, 
  Search, 
  Store, 
  Package, 
  Shirt, 
  FileText, 
  Sparkles, 
  Clock, 
  MessageCircle, 
  Layers,
  Flame
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

  // Filter feed produk
  const filteredProducts = productList.filter((p) => {
    if (homeCategory === "Semua") return true;
    return (
      p.category === homeCategory ||
      p.categoryId === homeCategory ||
      (p.category && p.category.toLowerCase().includes(homeCategory.toLowerCase()))
    );
  });

  const bestSellers = productList.filter(p => p.isBestSeller);
  // Kurasi spotlight terpopuler (maksimal 4 di mobile)
  const spotlightMobile = (homeCategory === "Semua" ? (bestSellers.length >= 4 ? bestSellers : productList) : filteredProducts).slice(0, 4);
  const spotlightDesktop = (homeCategory === "Semua" ? (bestSellers.length >= 8 ? bestSellers : productList) : filteredProducts).slice(0, 8);

  const categoryStories = [
    { id: "all", name: "Semua", categoryName: "Semua", icon: Sparkles },
    { id: "spanduk", name: "Spanduk", categoryName: "Spanduk & Banner", icon: Store },
    { id: "stiker", name: "Stiker", categoryName: "Stiker & Label Kemasan", icon: Layers },
    { id: "kemasan", name: "Packaging", categoryName: "Packaging", icon: Package },
    { id: "merch", name: "Sablon", categoryName: "Merchandise & Sablon", icon: Shirt },
    { id: "signage", name: "Neon Box", categoryName: "Signage & Akrilik", icon: Award },
    { id: "nota", name: "Brosur", categoryName: "Media Promosi & Kantor", icon: FileText },
  ];

  return (
    <div className="bg-white min-h-screen pt-16 sm:pt-20 md:pt-28 pb-28 md:pb-24">
      {/* ======================================================== */}
      {/* 📱 MOBILE VIEW: PURE APP EXPERIENCE (VISUAL-FIRST & SLEEK) */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-5 px-4 max-w-lg mx-auto">
        
        {/* 1. VISUAL HERO BANNER CAROUSEL */}
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
                      className="min-w-full snap-center relative aspect-[16/9] rounded-3xl overflow-hidden shadow-xs group active:scale-[0.99] transition-transform block"
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
                        <div className="w-full h-full bg-neutral-100" />
                      )}

                      {/* Smooth cinematic gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400 mb-0.5">
                          Layanan Pilihan
                        </span>
                        <h2 className="text-white font-extrabold text-base sm:text-lg leading-tight line-clamp-2">
                          {b.title}
                        </h2>
                        {b.subtitle && (
                          <p className="text-white/80 text-[11px] mt-0.5 line-clamp-1 font-normal">
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

        {/* 2. VISUAL CATEGORY STORIES (CLEAN ICONS, ZERO CLUTTER) */}
        <div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth px-0.5 py-1">
            {categoryStories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = homeCategory === cat.categoryName || (cat.categoryName === "Semua" && homeCategory === "Semua");
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setHomeCategory(cat.categoryName);
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-90 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isSelected 
                      ? "bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 scale-105" 
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80"
                  }`}>
                    <Icon size={19} strokeWidth={isSelected ? 2.2 : 1.75} />
                  </div>
                  <span className={`text-[10px] tracking-tight ${
                    isSelected ? "text-neutral-950 font-bold" : "text-neutral-500 font-medium"
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CURATED SPOTLIGHT (FOTO-FIRST, 4 PRODUK TERPILIH) */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <div className="flex items-center gap-1.5">
              <Flame size={15} className="text-amber-500 fill-amber-500" />
              <h3 className="font-extrabold text-sm text-neutral-900 tracking-tight">
                {homeCategory === "Semua" ? "Paling Sering Dipesan" : homeCategory}
              </h3>
            </div>
            <Link
              href="/produk"
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5"
            >
              Semua ({productList.length}) <ArrowRight size={12} />
            </Link>
          </div>

          {/* 2x2 Curated Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-neutral-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : spotlightMobile.length === 0 ? (
            <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200/60 my-2 space-y-2">
              <Package size={20} className="text-neutral-400 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                Belum ada produk untuk kategori ini.
              </p>
              <button
                type="button"
                onClick={() => setHomeCategory("Semua")}
                className="text-xs font-semibold text-neutral-900 underline"
              >
                Lihat semua produk
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {spotlightMobile.map((item) => (
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

          {/* Clean Explore Full Catalog Pill */}
          <div className="pt-3">
            <Link
              href="/produk"
              className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 rounded-2xl text-xs font-semibold text-neutral-900 active:scale-98 transition-all"
            >
              <span className="text-[11px]">Buka Seluruh Katalog ({productList.length} Produk)</span>
              <ArrowRight size={13} className="text-neutral-400" />
            </Link>
          </div>
        </div>

        {/* 4. INSPIRASI VISUAL LAYANAN (LOOKBOOK PHOTO CARDS - 100% VISUAL, ZERO TEXT ESSAYS) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h3 className="font-extrabold text-sm text-neutral-900 tracking-tight">
              Inspirasi Hasil Cetak
            </h3>
            <span className="text-[10px] text-neutral-400 font-medium">Geser untuk melihat</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-1 px-0.5">
            {/* Visual Card 1: Stiker & Kemasan */}
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi Cetak Stiker & Box Kemasan UMKM.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[240px] relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xs group active:scale-[0.98] transition-transform block"
            >
              <Image
                src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800"
                alt="Stiker & Kemasan Custom"
                fill
                sizes="240px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                  Label & Packaging
                </span>
                <h4 className="text-white text-xs font-bold leading-snug">
                  Stiker Vinyl & Box UMKM
                </h4>
                <span className="text-white/80 text-[10px] mt-0.5 flex items-center gap-1 font-medium">
                  Konsultasi Desain <ArrowRight size={10} />
                </span>
              </div>
            </a>

            {/* Visual Card 2: Spanduk & Event */}
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi Spanduk & Banner Event Kilat.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[240px] relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xs group active:scale-[0.98] transition-transform block"
            >
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800"
                alt="Spanduk & Banner Kilat"
                fill
                sizes="240px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                  Outdoor & Promosi
                </span>
                <h4 className="text-white text-xs font-bold leading-snug">
                  Spanduk & Banner Kilat
                </h4>
                <span className="text-white/80 text-[10px] mt-0.5 flex items-center gap-1 font-medium">
                  Selesai 24 Jam <ArrowRight size={10} />
                </span>
              </div>
            </a>

            {/* Visual Card 3: Kaos & Merchandise */}
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi Sablon Kaos / Seragam.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="snap-start shrink-0 w-[240px] relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xs group active:scale-[0.98] transition-transform block"
            >
              <Image
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800"
                alt="Sablon Kaos & Merchandise"
                fill
                sizes="240px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider mb-0.5">
                  Apparel & Merch
                </span>
                <h4 className="text-white text-xs font-bold leading-snug">
                  Sablon DTF & Seragam
                </h4>
                <span className="text-white/80 text-[10px] mt-0.5 flex items-center gap-1 font-medium">
                  Katun Combed Premium <ArrowRight size={10} />
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* 5. APP-STYLE SLIM ACTION CAPSULE (COMPACT & MODERN) */}
        <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-neutral-900 truncate">Punya Desain Sendiri?</h4>
              <p className="text-[10px] text-neutral-500 truncate">Kirim via WA, gratis review file</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi cetak dan kirim file desain.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-semibold shrink-0 transition-transform shadow-xs"
          >
            Chat CS
          </a>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 💻 DESKTOP LAYOUT (EXPANSIVE, MINIMALIST & MODERN LIGHT)   */}
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

        {/* DESKTOP PROMO BANNERS */}
        {banners.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20">
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

        {/* CURATED SPOTLIGHT PRODUCTS (MAKSIMAL 8 PRODUK) */}
        <section id="katalog" className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-5 border-b border-neutral-200/60 gap-4">
            <div>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 block mb-1">
                Katalog Pilihan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Produk Unggulan & Paling Banyak Dipesan
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Pilihan terfavorit dengan jaminan proses cepat dan kualitas warna presisi.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link 
                href="/produk" 
                className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Buka Seluruh Katalog ({productList.length})</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Minimalist Filter Pills */}
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
              Semua Unggulan
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
                    {cName}
                  </button>
                );
              })}
          </div>

          {/* Curated Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-neutral-100 animate-pulse space-y-3">
                  <div className="aspect-square bg-neutral-100 rounded-xl" />
                  <div className="h-4 bg-neutral-100 rounded w-2/3" />
                  <div className="h-4 bg-neutral-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : spotlightDesktop.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {spotlightDesktop.map((item) => (
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

              <div className="text-center mt-10">
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  <span>Jelajahi Seluruh {productList.length} Produk di Halaman Katalog</span>
                  <ArrowRight size={14} className="text-neutral-300" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-100 max-w-lg mx-auto">
              <Package size={28} className="text-neutral-400 mx-auto mb-3" />
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

        {/* 🌿 MODERN LIGHT CONSULTATION CARD */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="bg-gradient-to-br from-neutral-50 via-white to-emerald-50/50 border border-neutral-200/80 rounded-3xl p-8 lg:p-12 text-neutral-900 shadow-sm flex flex-col lg:flex-row gap-8 justify-between items-center">
            <div className="lg:w-[65%] w-full">
              <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>KONSULTASI & PESAN LANGSUNG VIA WHATSAPP</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-neutral-900 mb-3 leading-tight tracking-tight">
                Punya Kebutuhan Cetak Spesifik atau Partai Besar?
              </h2>
              <p className="text-neutral-500 text-xs sm:text-sm max-w-xl mb-6 leading-relaxed">
                Kirimkan file desain Anda atau konsultasikan spesifikasi ukuran, jenis bahan, dan tenggat waktu. Tim Cetak.inc siap memberikan penawaran terbaik dalam hitungan menit.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-neutral-700 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 
                  <span>Pengerjaan Cepat & Rapi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> 
                  <span>Garansi Kepuasan Kualitas Cetak</span>
                </div>
              </div>
            </div>

            <div className="lg:w-[30%] flex flex-col gap-3 w-full">
              <a 
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya ingin konsultasi cetak dan kirim file.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95 text-center"
              >
                <MessageCircle size={18} />
                <span>Chat WhatsApp Sekarang</span>
              </a>
              <span className="text-[11px] text-center text-neutral-400 font-normal">
                ⚡ Balasan cepat setiap hari kerja
              </span>
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
