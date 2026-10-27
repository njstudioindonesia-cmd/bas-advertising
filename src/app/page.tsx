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
  const flashSaleProducts = productList.slice(0, 6);

  // Filter feed produk di halaman Home
  const displayFeed = productList.filter((p) => {
    if (homeCategory === "Semua") return true;
    return (
      p.category === homeCategory ||
      p.categoryId === homeCategory ||
      (p.category && p.category.toLowerCase().includes(homeCategory.toLowerCase()))
    );
  });

  // 8 Grid Categories Mobile
  const mobileGridCategories = [
    {
      id: "cat-spanduk",
      name: "Spanduk & Banner",
      icon: Sparkles,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-orange-500/25",
      badge: "P×L",
      categoryName: "Spanduk & Banner",
      href: "/produk?category=Spanduk%20%26%20Banner",
    },
    {
      id: "cat-stiker",
      name: "Stiker & Label",
      icon: Layers,
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/25",
      badge: "A3+",
      categoryName: "Stiker & Label Kemasan",
      href: "/produk?category=Stiker%20%26%20Label%20Kemasan",
    },
    {
      id: "cat-kemasan",
      name: "Kemasan & Box",
      icon: Package,
      gradient: "from-emerald-600 to-teal-500",
      shadow: "shadow-emerald-500/25",
      badge: "Kustom",
      categoryName: "Packaging",
      href: "/produk?category=Packaging",
    },
    {
      id: "cat-merch",
      name: "Kaos & Sablon",
      icon: Shirt,
      gradient: "from-purple-600 to-violet-600",
      shadow: "shadow-purple-500/25",
      badge: "DTF",
      categoryName: "Merchandise & Sablon",
      href: "/produk?category=Merchandise%20%26%20Sablon",
    },
    {
      id: "cat-signage",
      name: "Neon Box Akrilik",
      icon: Store,
      gradient: "from-blue-600 to-indigo-600",
      shadow: "shadow-blue-500/25",
      badge: "LED",
      categoryName: "Signage & Akrilik",
      href: "/produk?category=Signage%20%26%20Akrilik",
    },
    {
      id: "cat-nota",
      name: "Brosur & Nota",
      icon: FileText,
      gradient: "from-slate-700 to-slate-900",
      shadow: "shadow-slate-500/25",
      badge: "NCR",
      categoryName: "Media Promosi & Kantor",
      href: "/produk?category=Media%20Promosi%20%26%20Kantor",
    },
    {
      id: "cat-plakat",
      name: "Plakat & Akrilik",
      icon: Award,
      gradient: "from-amber-600 to-yellow-500",
      shadow: "shadow-amber-500/25",
      badge: "Laser",
      categoryName: "Signage & Akrilik",
      href: "/produk?category=Signage%20%26%20Akrilik",
    },
    {
      id: "cat-all",
      name: "Semua Produk",
      icon: Package,
      gradient: "from-slate-800 to-slate-950",
      shadow: "shadow-slate-900/25",
      badge: productList.length > 0 ? `${productList.length}` : null,
      categoryName: null,
      href: "/produk",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 md:pb-24">
      {/* ======================================================== */}
      {/* 📱 MOBILE APP HOME EXPERIENCE                           */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-4 px-3.5 max-w-lg mx-auto">
        {/* Mobile Promo Banners - Modern & Minimalist */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-1 pb-1">
          {loading ? (
            <div className="min-w-[85%] h-36 rounded-2xl bg-neutral-200/70 animate-pulse" />
          ) : banners.length > 0 ? (
            banners
              .filter((b) => b.isActive !== false)
              .map((b, idx) => {
                const imgUrl = b.imageUrl || b.image_url;
                return (
                  <article
                    key={b.id || idx}
                    className="min-w-[85%] snap-center rounded-2xl bg-white border border-neutral-200/70 p-4 shadow-2xs flex flex-col justify-between h-40 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="min-w-0 flex-1">
                        <span className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full inline-block mb-1.5">
                          Layanan Pilihan
                        </span>
                        <h3 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-2">
                          {b.title}
                        </h3>
                        {b.subtitle && (
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1">
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                      {imgUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0 relative border border-neutral-100">
                          <Image
                            src={imgUrl}
                            alt={b.title}
                            fill
                            sizes="64px"
                            unoptimized={Boolean(imgUrl.startsWith("data:"))}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-neutral-100 mt-2">
                      <Link
                        href={b.ctaHref || b.cta_href || "/produk"}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl inline-flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        {b.ctaLabel || b.cta_label || "Lihat Penawaran"} <ArrowRight size={12} />
                      </Link>
                      <span className="text-[10px] text-neutral-400 font-medium">Cetak.inc</span>
                    </div>
                  </article>
                );
              })
          ) : null}
        </div>

        {/* 8 Mobile Category Grid - Clean & Minimalist */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-neutral-200/70 shadow-2xs">
          {loading ? (
            <div className="grid grid-cols-4 gap-3 text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-200/70 mb-1.5" />
                  <div className="w-12 h-2.5 bg-neutral-200/70 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 text-center">
              {mobileGridCategories.map((item) => {
                const Icon = item.icon;
                const handleClick = (e: React.MouseEvent) => {
                  if (item.categoryName) {
                    e.preventDefault();
                    setHomeCategory(item.categoryName);
                    const el = document.getElementById("home-product-feed");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                };

                const isExternal = item.href.startsWith("http");

                return isExternal ? (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="relative mb-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 text-neutral-700 group-hover:text-white flex items-center justify-center border border-neutral-200/60 shadow-2xs transition-colors">
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-semibold uppercase px-1.5 py-0.2 rounded-full shadow-2xs bg-neutral-900 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-neutral-700 group-hover:text-neutral-900 leading-tight tracking-tight line-clamp-2 h-6 flex items-center justify-center px-0.5">
                      {item.name}
                    </span>
                  </a>
                ) : (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    onClick={handleClick}
                    className="flex flex-col items-center group active:scale-90 transition-transform"
                  >
                    <div className="relative mb-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 text-neutral-700 group-hover:text-white flex items-center justify-center border border-neutral-200/60 shadow-2xs transition-colors">
                        <Icon size={20} strokeWidth={2} />
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-semibold uppercase px-1.5 py-0.2 rounded-full shadow-2xs bg-neutral-900 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-neutral-700 group-hover:text-neutral-900 leading-tight tracking-tight line-clamp-2 h-6 flex items-center justify-center px-0.5">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Value Chips Row */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { label: "Cepat 24 Jam", icon: Clock },
            { label: "Garansi 100%", icon: ShieldCheck },
            { label: "Kirim Padang", icon: Truck },
            { label: "Bisa Satuan", icon: Sparkles }
          ].map((pill, i) => {
            const Icon = pill.icon;
            return (
              <div key={i} className="bg-white py-1.5 px-1 rounded-xl border border-neutral-200/70 flex items-center justify-center gap-1.5 text-[10px] font-medium text-neutral-600 shadow-2xs">
                <Icon size={12} className="text-neutral-500 shrink-0" />
                <span className="truncate">{pill.label}</span>
              </div>
            );
          })}
        </div>

        {/* Paling Laris Horizontal Rail */}
        {flashSaleProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-neutral-200/70 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900">
                  Produk Terpopuler
                </h3>
              </div>
              <Link href="/produk" className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5">
                Lihat Semua <ArrowRight size={11} />
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-1">
              {flashSaleProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="min-w-[136px] w-[136px] snap-start bg-neutral-50/70 rounded-xl p-2.5 border border-neutral-200/60 flex flex-col justify-between shrink-0 hover:border-neutral-300 transition-colors"
                >
                  <Link href={`/produk/${prod.id}`} className="block">
                    <div className="relative aspect-square rounded-lg bg-neutral-100 overflow-hidden mb-2">
                      <Image
                        src={prod.imageUrl || prod.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"}
                        alt={prod.title || prod.name || "Produk"}
                        fill
                        sizes="136px"
                        unoptimized={Boolean((prod.imageUrl || prod.img)?.startsWith("data:"))}
                        className="object-cover"
                      />
                    </div>
                    <h4 className="text-[11px] font-medium text-neutral-900 line-clamp-1 leading-tight mb-1">
                      {prod.title || prod.name}
                    </h4>
                    <div className="font-bold text-xs text-neutral-900 tracking-tight">
                      {prod.price || `Rp ${(prod.priceNumber || 0).toLocaleString("id-ID")}`}
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSheetProduct(prod);
                      setIsSheetOpen(true);
                    }}
                    className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95"
                  >
                    <MessageCircle size={11} />
                    <span>Pesan</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feed Katalog Produk Mobile */}
        <div id="home-product-feed" className="scroll-mt-28">
          {/* Mobile Feed Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 block">
                Katalog Produk
              </span>
              <h3 className="font-bold text-sm text-neutral-900">
                {homeCategory === "Semua" ? "Katalog Unggulan" : (homeCategory === "PACKAGING" ? "Packaging" : homeCategory)}
              </h3>
            </div>
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              {displayFeed.length} Produk
            </span>
          </div>

          {/* Swipeable Category Chips - Clean & Minimalist */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3.5 px-3.5 mb-3.5">
            <button
              type="button"
              onClick={() => setHomeCategory("Semua")}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
                homeCategory === "Semua"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Semua <span className="opacity-60 text-[11px] ml-0.5">({productList.length})</span>
            </button>

            {categories.map((c: any) => {
              const rawName = typeof c === "string" ? c : c.name;
              const cName = rawName === "PACKAGING" ? "Packaging" : rawName === "SPANDUK" ? "Spanduk" : rawName === "STIKER" ? "Stiker" : rawName;
              const count = productList.filter((p) => p.category === rawName || p.categoryId === c.id).length;
              if (count === 0) return null;
              const isSelected = homeCategory === rawName;

              return (
                <button
                  key={c.id || rawName}
                  type="button"
                  onClick={() => setHomeCategory(rawName)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 shrink-0 ${
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

          {/* 2-Column Grid Feed */}
          {loading ? (
            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-2.5 border border-gray-100 animate-pulse space-y-2">
                  <div className="aspect-square bg-gray-200 rounded-xl" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : displayFeed.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-2xs space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
                <Package size={24} />
              </div>
              <h4 className="font-extrabold text-sm text-[#1E1B4B]">Katalog Belum Memiliki Produk</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Produk sedang disusun oleh tim kami. Silakan hubungi CS kami via WhatsApp untuk konsultasi dan pemesanan.
              </p>
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya mau konsultasi pemesanan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
              >
                <MessageCircle size={14} /> Hubungi WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {displayFeed.map((item) => (
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

          <div className="pt-4 text-center">
            <Link
              href="/produk"
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-[#1E1B4B] shadow-2xs active:scale-98 transition-transform"
            >
              {productList.length > 0 
                ? `Lihat Seluruh ${productList.length} Produk Katalog` 
                : "Kunjungi Seluruh Katalog"} <ArrowRight size={14} />
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
              <span>Percetakan & Advertising Studio • Kota Padang</span>
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
              { icon: <Truck size={18} className="text-neutral-700" />, title: "Antar Se-Padang", desc: "Layanan kirim cepat & aman." },
              { icon: <Award size={18} className="text-neutral-700" />, title: "Kualitas Terjamin", desc: "Bahan bermutu & hasil tajam." }
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

          {/* Minimalist Horizontal Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 mb-8">
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

          {/* Minimalist Product Grid */}
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
                {displayFeed.slice(0, 15).map((item) => (
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

              {displayFeed.length > 15 && (
                <div className="text-center mt-10">
                  <Link
                    href={`/produk${homeCategory !== "Semua" ? `?category=${encodeURIComponent(homeCategory)}` : ""}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-xs border border-neutral-200 shadow-2xs hover:shadow-sm transition-all active:scale-95"
                  >
                    <span>Lihat Seluruh {displayFeed.length} Produk Kategori Ini</span>
                    <ArrowRight size={14} className="text-neutral-400" />
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
