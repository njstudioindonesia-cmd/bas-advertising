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
    <div className="bg-[#F8F9FA] min-h-screen pt-26 sm:pt-28 md:pt-36 pb-20 md:pb-24">
      {/* ======================================================== */}
      {/* 📱 MOBILE APP HOME EXPERIENCE                           */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-4 px-3.5 max-w-lg mx-auto">
        {/* Mobile Promo Banners */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-1 pb-1">
          {loading ? (
            <div className="min-w-[88%] h-36 rounded-2xl bg-gray-200 animate-pulse" />
          ) : banners.length > 0 ? (
            banners
              .filter((b) => b.isActive !== false)
              .map((b, idx) => {
                const gradients = [
                  "from-[#1E1B4B] via-[#0B1E36] to-orange-950",
                  "from-orange-600 to-amber-500",
                  "from-emerald-700 to-teal-800",
                  "from-indigo-900 to-blue-800",
                ];
                const grad = gradients[idx % gradients.length];
                const imgUrl = b.imageUrl || b.image_url;
                return (
                  <div
                    key={b.id || idx}
                    className={`min-w-[88%] snap-center rounded-2xl bg-gradient-to-r ${grad} p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36`}
                  >
                    {imgUrl && (
                      <div className="absolute inset-0 z-0 opacity-25">
                        <Image
                          src={imgUrl}
                          alt={b.title}
                          fill
                          unoptimized={imgUrl.startsWith("data:")}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <span className="bg-[#F97316] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-2xs">
                        🔥 Promo Cetak.inc
                      </span>
                      <h2 className="font-extrabold text-base leading-tight drop-shadow-xs">
                        {b.title}
                      </h2>
                      {b.subtitle && (
                        <p className="text-[10px] text-gray-200 mt-1 line-clamp-1 drop-shadow-xs">
                          {b.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <Link
                        href={b.ctaHref || b.cta_href || "/produk"}
                        className="bg-white text-[#1E1B4B] text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                      >
                        {b.ctaLabel || b.cta_label || "Lihat Promo"} <ArrowRight size={12} />
                      </Link>
                      <span className="text-[9px] text-gray-300">Kirim Seluruh Padang</span>
                    </div>
                    <div className="absolute right-0 bottom-0 w-28 h-28 opacity-20 pointer-events-none bg-orange-400 rounded-full blur-2xl" />
                  </div>
                );
              })
          ) : (
            <div className="min-w-[88%] snap-center rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#0B1E36] to-orange-950 p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
              <div className="relative z-10">
                <span className="bg-[#F97316] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-2xs">
                  🔥 Solusi Cetak Cepat
                </span>
                <h2 className="font-extrabold text-base leading-tight">
                  Cetak Kilat & Kualitas Juara <br />
                  <span className="text-amber-400">Garansi Tepat Waktu</span>
                </h2>
                <p className="text-[10px] text-gray-300 mt-1 line-clamp-1">
                  Spanduk, packaging, stiker, seragam crew & merchandise.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <Link 
                  href="/produk" 
                  className="bg-white text-[#1E1B4B] text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                >
                  Buka Katalog <ArrowRight size={12} />
                </Link>
                <span className="text-[9px] text-gray-400">Kirim Seluruh Padang</span>
              </div>
            </div>
          )}
        </div>

        {/* 8 Mobile Category Grid */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-gray-100/90 shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
          {loading ? (
            <div className="grid grid-cols-4 gap-3 text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="flex flex-col items-center animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200 mb-1.5" />
                  <div className="w-12 h-2.5 bg-gray-200 rounded" />
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
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-md ${item.shadow} border border-white/20`}>
                        <Icon size={22} strokeWidth={2.2} />
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs ring-1 ring-white bg-[#1E1B4B] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-800 leading-tight tracking-tight line-clamp-2 h-6 flex items-center justify-center px-0.5">
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
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-md ${item.shadow} group-hover:scale-105 transition-all duration-200 border border-white/20`}>
                        <Icon size={22} strokeWidth={2.2} />
                      </div>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs ring-1 ring-white bg-[#1E1B4B] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-gray-800 leading-tight tracking-tight line-clamp-2 h-6 flex items-center justify-center px-0.5">
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
              <div key={i} className="bg-white py-1.5 px-1 rounded-xl border border-gray-100/80 flex items-center justify-center gap-1 text-[9px] font-semibold text-gray-600 shadow-2xs">
                <Icon size={11} className="text-[#F97316] shrink-0" />
                <span className="truncate">{pill.label}</span>
              </div>
            );
          })}
        </div>

        {/* Paling Laris Horizontal Rail */}
        {flashSaleProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Flame size={13} />
                </span>
                <h3 className="font-extrabold text-xs text-[#1E1B4B]">
                  Paling Laris di Padang
                </h3>
              </div>
              <Link href="/produk" className="text-[10px] font-bold text-[#F97316] flex items-center gap-0.5">
                Lihat Semua <ArrowRight size={10} />
              </Link>
            </div>

            <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-1">
              {flashSaleProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="min-w-[130px] w-[130px] snap-start bg-slate-50/80 rounded-xl p-2 border border-gray-100 flex flex-col justify-between shrink-0"
                >
                  <Link href={`/produk/${prod.id}`} className="block">
                    <div className="relative aspect-square rounded-lg bg-gray-200 overflow-hidden mb-1.5">
                      <Image
                        src={prod.imageUrl || prod.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"}
                        alt={prod.title || prod.name || "Produk"}
                        fill
                        sizes="130px"
                        unoptimized={Boolean((prod.imageUrl || prod.img)?.startsWith("data:"))}
                        className="object-cover"
                      />
                    </div>
                    <h4 className="text-[11px] font-medium text-gray-800 line-clamp-1 leading-tight mb-1">
                      {prod.title || prod.name}
                    </h4>
                    <div className="font-bold text-xs text-[#F97316]">
                      {prod.price || `Rp ${(prod.priceNumber || 0).toLocaleString("id-ID")}`}
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setSheetProduct(prod);
                      setIsSheetOpen(true);
                    }}
                    className="mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
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
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
              <h3 className="font-extrabold text-xs sm:text-sm text-[#1E1B4B]">
                {homeCategory === "Semua" ? "Katalog Produk Unggulan" : homeCategory}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-2xs">
              {displayFeed.length} Produk
            </span>
          </div>

          {/* Swipeable Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3.5 px-3.5 mb-3">
            <button
              type="button"
              onClick={() => setHomeCategory("Semua")}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 shrink-0 active:scale-95 flex items-center gap-1.5 ${
                homeCategory === "Semua"
                  ? "bg-[#1E1B4B] text-white shadow-xs"
                  : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-2xs"
              }`}
            >
              <span>Semua</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${homeCategory === "Semua" ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>
                {productList.length}
              </span>
            </button>

            {categories.map((c: any) => {
              const cName = typeof c === "string" ? c : c.name;
              const count = productList.filter((p) => p.category === cName || p.categoryId === c.id).length;
              const isSelected = homeCategory === cName;

              return (
                <button
                  key={c.id || cName}
                  type="button"
                  onClick={() => setHomeCategory(cName)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 shrink-0 active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1E1B4B] text-white shadow-xs"
                      : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200/80 shadow-2xs"
                  }`}
                >
                  <span>{cName}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {count}
                  </span>
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
        {/* HERO SECTION CARD */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative flex flex-col-reverse lg:flex-row border border-gray-100"
          >
            {/* Left Content */}
            <div className="lg:w-[60%] p-8 sm:p-10 lg:p-16 flex flex-col justify-center relative z-10 bg-white">
              <div className="inline-block bg-orange-50 text-[#F97316] font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 w-fit">
                🔥 SOLUSI CETAK CEPAT & PRESISI
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B4B] leading-[1.1] mb-4 tracking-tight">
                Cari Cetakan Apapun, <br />
                <span className="text-[#F97316]">Kami Buatkan.</span>
              </h1>
              
              <p className="text-gray-500 text-base lg:text-lg mb-8 max-w-lg leading-relaxed">
                Spanduk kilat, stiker label kemasan, seragam crew, neon box & merchandise kustom dengan kualitas studio.
              </p>
              
              {/* SEARCH BAR */}
              <form onSubmit={handleSearch} className="max-w-lg relative mb-4 shadow-lg shadow-gray-200/50 rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-[#F97316]" />
                </div>
                <input
                  type="text"
                  placeholder="Ketik produk... (Contoh: Spanduk, Stiker, Paper Cup)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-[120px] py-5 bg-white border-2 border-gray-100 rounded-2xl text-base focus:outline-none focus:border-[#F97316] transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold px-6 rounded-xl flex items-center justify-center transition-colors"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Right Image */}
            <div className="lg:w-[40%] h-[300px] sm:h-[400px] lg:h-auto relative">
              <Image 
                src="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=1600&auto=format&fit=crop" 
                alt="Fasilitas percetakan modern Cetak.inc" 
                fill 
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* TRUST SIGNALS ROW */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Clock className="text-[#3B82F6]" size={20} />, bg: "bg-blue-50", title: "Proses Cepat", desc: "Selesai tepat waktu." },
              { icon: <ShieldCheck className="text-[#EC4899]" size={20} />, bg: "bg-pink-50", title: "Pesan Langsung", desc: "Via WhatsApp instan." },
              { icon: <Truck className="text-[#10B981]" size={20} />, bg: "bg-green-50", title: "Kirim se-Padang", desc: "Layanan antar cepat." },
              { icon: <Award className="text-[#F59E0B]" size={20} />, bg: "bg-yellow-50", title: "Garansi Kualitas", desc: "Presisi & rapi." }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 hover:border-orange-200 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.bg}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1B4B] text-sm mb-0.5">{feature.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-tight">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DESKTOP PROMO BANNERS */}
        {banners.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider block mb-1">
                  PENAWARAN & PROMOSI PILIHAN
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
                  Promo Spesial & Layanan Kilat
                </h2>
              </div>
              <Link href="/produk" className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1">
                Katalog Lengkap <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners
                .filter((b) => b.isActive !== false)
                .slice(0, 3)
                .map((b, idx) => {
                  const imgUrl = b.imageUrl || b.image_url;
                  return (
                    <div
                      key={b.id || idx}
                      className="relative rounded-3xl overflow-hidden bg-[#0B1E36] text-white p-6 flex flex-col justify-between min-h-[200px] border border-gray-100 shadow-md group"
                    >
                      {imgUrl && (
                        <div className="absolute inset-0 z-0 opacity-30 group-hover:scale-105 group-hover:opacity-40 transition-all duration-500">
                          <Image
                            src={imgUrl}
                            alt={b.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            unoptimized={Boolean(imgUrl.startsWith("data:"))}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="relative z-10">
                        <span className="bg-[#F97316] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full inline-block mb-3 shadow-xs">
                          🔥 Promo Pilihan
                        </span>
                        <h3 className="text-lg font-black leading-snug drop-shadow-xs">{b.title}</h3>
                        {b.subtitle && (
                          <p className="text-xs text-gray-200 mt-2 line-clamp-2 leading-relaxed drop-shadow-xs">
                            {b.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10 mt-4">
                        <Link
                          href={b.ctaHref || b.cta_href || "/produk"}
                          className="bg-white hover:bg-orange-50 text-[#0B1E36] text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          {b.ctaLabel || b.cta_label || "Lihat Promo"} <ArrowRight size={13} />
                        </Link>
                        <span className="text-[11px] text-gray-300">Cetak.inc</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* UNIFIED MINIMALIST CATALOG SECTION (SUBSTITUTES CLUTTERED 15-CARD TEXT WALL) */}
        <section id="katalog" className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20 scroll-mt-28">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider block mb-1">
                Katalog Produk Pilihan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
                Pilihan Cetak Lengkap & Presisi
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Pilih kategori dan pesan langsung via WhatsApp dengan spesifikasi pesanan Anda.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                {displayFeed.length} Produk Siap Cetak
              </span>
              <Link 
                href="/produk" 
                className="text-xs font-bold text-[#F97316] hover:text-orange-600 px-4 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors inline-flex items-center gap-1.5"
              >
                Semua Produk <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Minimalist Horizontal Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 mb-8">
            <button
              type="button"
              onClick={() => setHomeCategory("Semua")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-2 ${
                homeCategory === "Semua"
                  ? "bg-[#0B1E36] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/80 shadow-2xs"
              }`}
            >
              <span>Semua</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${homeCategory === "Semua" ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>
                {productList.length}
              </span>
            </button>

            {categories
              .filter((c: any) => {
                const cName = typeof c === "string" ? c : c.name;
                const count = productList.filter((p) => p.category === cName || p.categoryId === c.id).length;
                return count > 0;
              })
              .map((c: any) => {
                const cName = typeof c === "string" ? c : c.name;
                const count = productList.filter((p) => p.category === cName || p.categoryId === c.id).length;
                const isSelected = homeCategory === cName;

                return (
                  <button
                    key={c.id || cName}
                    type="button"
                    onClick={() => setHomeCategory(cName)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#0B1E36] text-white shadow-sm"
                        : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200/80 shadow-2xs"
                    }`}
                  >
                    <span>{cName}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Minimalist Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-3 border border-gray-100 animate-pulse space-y-3">
                  <div className="aspect-square bg-gray-100 rounded-xl" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : displayFeed.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-[#0B1E36] font-bold text-xs border border-gray-200/80 shadow-2xs hover:shadow-md transition-all active:scale-95"
                  >
                    <span>Lihat Seluruh {displayFeed.length} Produk Kategori Ini</span>
                    <ArrowRight size={14} className="text-[#F97316]" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto mb-3">
                <Package size={28} />
              </div>
              <h3 className="font-extrabold text-[#1E1B4B] text-base mb-1">Kategori Ini Belum Ada Produk</h3>
              <p className="text-xs text-gray-500 mb-4">
                Pilih kategori lain atau hubungi CS kami via WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setHomeCategory("Semua")}
                className="px-5 py-2.5 bg-[#0B1E36] text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
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
