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
  Star, 
  TrendingUp, 
  Zap, 
  Plus, 
  Check,
  Store,
  Utensils,
  Package,
  Shirt,
  Megaphone,
  FileText,
  Gift,
  Palette,
  Sparkles,
  Flame,
  Clock
} from "lucide-react";

import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import QuickProductCard from "@/components/QuickProductCard";
import ProductBottomSheet from "@/components/ProductBottomSheet";

export default function Home() {
  const [productList, setProductList] = useState<any[]>(products);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [sheetProduct, setSheetProduct] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = () => {
      const t = Date.now();
      fetch(`/api/products?t=${t}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setProductList(data.data);
          }
        })
        .catch(() => {});

      fetch(`/api/categories?t=${t}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setCategories(data.data);
          }
        })
        .catch(() => {});

      fetch(`/api/banners?t=${t}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setBanners(data.data);
          }
        })
        .catch(() => {});
    };

    loadData();

    // Listen for product & catalog updates from admin in same window or across tabs
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

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const topSellingProducts = productList.filter(p => p.isBestSeller).slice(0, 10);
  const flashSaleProducts = productList.slice(0, 6);

  // Quick 8 App Icons for Mobile
  const mobileAppCategories = [
    { name: "Outlet", icon: Store, bg: "bg-blue-500", text: "text-white", link: "/produk?category=Branding+Outlet" },
    { name: "Meja", icon: Utensils, bg: "bg-amber-500", text: "text-white", link: "/produk?category=Branding+Meja" },
    { name: "Kemasan", icon: Package, bg: "bg-emerald-500", text: "text-white", link: "/produk?category=Packaging" },
    { name: "Crew", icon: Shirt, bg: "bg-purple-500", text: "text-white", link: "/produk?category=Crew" },
    { name: "Promosi", icon: Megaphone, bg: "bg-rose-500", text: "text-white", link: "/produk?category=Marketing" },
    { name: "Kantor", icon: FileText, bg: "bg-slate-700", text: "text-white", link: "/produk?category=Barang+Cetak+Pendukung" },
    { name: "Merchandise", icon: Gift, bg: "bg-orange-500", text: "text-white", link: "/produk?category=Merchandise" },
    { name: "Studio 3D", icon: Palette, bg: "bg-indigo-600", text: "text-white", link: "/mockup" }
  ];

  const categoryIconMap: Record<string, any> = {
    "Branding Outlet": { icon: Store, bg: "bg-blue-500" },
    "Branding Meja": { icon: Utensils, bg: "bg-amber-500" },
    "Packaging": { icon: Package, bg: "bg-emerald-500" },
    "Crew": { icon: Shirt, bg: "bg-purple-500" },
    "Marketing": { icon: Megaphone, bg: "bg-rose-500" },
    "Barang Cetak Pendukung": { icon: FileText, bg: "bg-slate-700" },
    "Merchandise": { icon: Gift, bg: "bg-orange-500" },
    "Outdoor & Signage": { icon: Sparkles, bg: "bg-cyan-600" },
  };

  const dynamicMobileCategories = categories.length > 0
    ? [
        ...categories.slice(0, 7).map((c) => {
          const conf = categoryIconMap[c.name] || { icon: Package, bg: "bg-orange-500" };
          return {
            name: c.name.length > 10 ? c.name.slice(0, 9) + "…" : c.name,
            icon: conf.icon,
            bg: conf.bg,
            text: "text-white",
            link: `/produk?category=${encodeURIComponent(c.name)}`,
          };
        }),
        { name: "Studio 3D", icon: Palette, bg: "bg-indigo-600", text: "text-white", link: "/mockup" }
      ]
    : mobileAppCategories;

  const CATEGORY_DESCS: Record<string, string> = {
    "Branding Outlet": "Sticker kaca, wall graphic, X-banner, signage toko",
    "Branding Meja": "Table number, table tent, buku menu, coaster",
    "Packaging": "Paper cup, plastic cup, food box, paper bag kustom",
    "Crew": "Kaos seragam, apron barista, polo shirt, name tag",
    "Marketing": "Flyer, brosur promosi, voucher diskon, kartu nama",
    "Barang Cetak Pendukung": "Nota NCR, kop surat resmi, amplop, map invoice",
    "Merchandise": "Tote bag kanvas, tumbler grafir, topi bordir, gantungan kunci",
    "Outdoor & Signage": "Spanduk flexi Korea, neon box, huruf timbul akrilik",
  };

  const displayCategories = categories.length > 0 
    ? categories.map((c) => {
        const prodCount = productList.filter((p) => p.categoryId === c.id || p.category === c.name).length;
        return {
          id: c.id,
          title: c.name,
          count: `${prodCount || c.productCount || 0} Produk`,
          link: `/produk?category=${encodeURIComponent(c.name)}`,
          desc: CATEGORY_DESCS[c.name] || `Koleksi produk cetak kategori ${c.name}`,
        };
      })
    : [
        { id: "cat-outlet", title: "Branding Outlet", count: `${productList.filter(p => p.category === "Branding Outlet").length || 9} Produk`, link: "/produk?category=Branding+Outlet", desc: "Sticker kaca, wall graphic, X-banner, signage" },
        { id: "cat-meja", title: "Branding Meja", count: `${productList.filter(p => p.category === "Branding Meja").length || 7} Produk`, link: "/produk?category=Branding+Meja", desc: "Table number, table tent, menu cetak, coaster" },
        { id: "cat-packaging", title: "Packaging", count: `${productList.filter(p => p.category === "Packaging").length || 14} Produk`, link: "/produk?category=Packaging", desc: "Paper cup, plastic cup, food box, paper bag" },
        { id: "cat-crew", title: "Crew", count: `${productList.filter(p => p.category === "Crew").length || 6} Produk`, link: "/produk?category=Crew", desc: "Kaos crew, hoodie, apron barista, name tag" },
        { id: "cat-marketing", title: "Marketing", count: `${productList.filter(p => p.category === "Marketing").length || 11} Produk`, link: "/produk?category=Marketing", desc: "Flyer, brosur, voucher, member card, tiket" },
        { id: "cat-pendukung", title: "Barang Cetak Pendukung", count: `${productList.filter(p => p.category === "Barang Cetak Pendukung").length || 8} Produk`, link: "/produk?category=Barang+Cetak+Pendukung", desc: "Nota NCR, kop surat, amplop, kartu nama" },
        { id: "cat-merchandise", title: "Merchandise", count: `${productList.filter(p => p.category === "Merchandise").length || 29} Produk`, link: "/produk?category=Merchandise", desc: "Tote bag, tumbler, topi, mug, cardholder" },
        { id: "cat-outdoor", title: "Outdoor & Signage", count: `${productList.filter(p => p.category === "Outdoor & Signage").length || 5} Produk`, link: "/produk?category=Outdoor+%26+Signage", desc: "Spanduk flexi Korea, neon box, huruf timbul" }
      ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-20 md:pt-36 pb-20 md:pb-24">

      {/* ======================================================== */}
      {/* 📱 MOBILE APP HOME EXPERIENCE (POTRAIT NATIVE APP FEEL) */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-4 px-3.5 max-w-lg mx-auto">
        
        {/* Mobile App Promo Banners (Horizontal Touch Swipe) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-1 pb-1">
          {banners.length > 0 ? (
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
                        {b.ctaLabel || b.cta_label || "Pesan Sekarang"} <ArrowRight size={12} />
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
                  🔥 Promo Spesial Cetak.inc
                </span>
                <h2 className="font-extrabold text-base leading-tight">
                  Branding Cafe & Resto <br />
                  <span className="text-amber-400">Diskon Spesial 25%</span>
                </h2>
                <p className="text-[10px] text-gray-300 mt-1 line-clamp-1">
                  Cup, kemasan makanan, seragam crew & merchandise.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <Link 
                  href="/produk?category=Packaging" 
                  className="bg-white text-[#1E1B4B] text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                >
                  Pesan Sekarang <ArrowRight size={12} />
                </Link>
                <span className="text-[9px] text-gray-400">Kirim Seluruh Padang</span>
              </div>
              <div className="absolute right-0 bottom-0 w-28 h-28 opacity-20 pointer-events-none bg-orange-400 rounded-full blur-2xl" />
            </div>
          )}
        </div>

        {/* 8 Mobile App Category Icons Grid */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-center">
            {dynamicMobileCategories.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={idx} 
                  href={item.link}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.text} flex items-center justify-center shadow-xs mb-1.5 transition-shadow`}>
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 leading-tight">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
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

        {/* Flash Sale / Paling Laris Horizontal Touch Rail */}
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
                      src={prod.img}
                      alt={prod.title}
                      fill
                      sizes="130px"
                      className="object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                      -25%
                    </span>
                  </div>
                  <h4 className="text-[11px] font-medium text-gray-800 line-clamp-1 leading-tight mb-1">
                    {prod.title}
                  </h4>
                  <div className="font-bold text-xs text-[#F97316]">
                    {prod.price}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(prod, e)}
                  className={`mt-1.5 w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                    addedId === prod.id 
                      ? "bg-green-600 text-white" 
                      : "bg-orange-100 text-[#F97316] hover:bg-[#F97316] hover:text-white"
                  }`}
                >
                  {addedId === prod.id ? <Check size={11} /> : <Plus size={11} />}
                  <span>{addedId === prod.id ? "Masuk" : "+ Keranjang"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Rekomendasi Produk (2-Column Mobile Grid) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-extrabold text-sm text-[#1E1B4B]">
              Rekomendasi Pilihan
            </h3>
            <span className="text-[10px] text-gray-400">
              {topSellingProducts.length} Produk Populer
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {topSellingProducts.map((item) => (
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

          <div className="pt-4 text-center">
            <Link
              href="/produk"
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-[#1E1B4B] shadow-2xs active:scale-98 transition-transform"
            >
              Lihat Seluruh 89+ Produk Katalog <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 💻 DESKTOP LAYOUT (LARGE VIEWPORT OPTIMIZED)            */}
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
              <div className="inline-block bg-[#FDF2F8] text-[#EC4899] font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 w-fit">
                🔥 SOLUSI CETAK CEPAT & MURAH
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E1B4B] leading-[1.1] mb-4 tracking-tight">
                Cari Cetakan Apapun, <br />
                <span className="text-[#F97316]">Kami Buatkan.</span>
              </h1>
              
              <p className="text-gray-500 text-base lg:text-lg mb-8 max-w-lg leading-relaxed">
                Kualitas premium, harga pabrik. Ratusan bisnis telah mempercayakan branding mereka kepada kami tanpa rasa khawatir.
              </p>
              
              {/* SEARCH BAR IN HERO */}
              <form onSubmit={handleSearch} className="max-w-lg relative mb-4 shadow-lg shadow-gray-200/50 rounded-2xl group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-[#F97316]" />
                </div>
                <input
                  type="text"
                  placeholder="Ketik produk... (Contoh: Spanduk, Brosur, Paper Cup)"
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
              <p className="text-xs text-gray-400 font-medium ml-2">
                Pencarian Populer: <Link href="/produk?q=Paper+Cup" className="text-[#F97316] hover:underline">Paper Cup</Link>, <Link href="/produk?q=Tumbler" className="text-[#F97316] hover:underline">Tumbler</Link>, <Link href="/produk?q=Apron" className="text-[#F97316] hover:underline">Apron Crew</Link>, <Link href="/produk?q=Tote+Bag" className="text-[#F97316] hover:underline">Tote Bag</Link>
              </p>
            </div>

            {/* Right Image */}
            <div className="lg:w-[40%] h-[300px] sm:h-[400px] lg:h-auto relative" style={{ maskImage: "linear-gradient(to right, transparent, black 25%)", WebkitMaskImage: "linear-gradient(to right, transparent, black 25%)" }}>
              <Image 
                src="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=1600&auto=format&fit=crop" 
                alt="Fasilitas percetakan modern Cetak.inc" 
                fill 
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-right"
                priority
              />
            </div>
          </motion.div>
        </section>

        {/* TRUST SIGNALS ROW */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <CheckCircle className="text-[#3B82F6]" size={20} />, bg: "bg-blue-50", title: "Proses Cepat", desc: "Selesai tepat waktu." },
              { icon: <ShieldCheck className="text-[#EC4899]" size={20} />, bg: "bg-pink-50", title: "Bayar Aman", desc: "Sistem transparan." },
              { icon: <Truck className="text-[#10B981]" size={20} />, bg: "bg-green-50", title: "Gratis Ongkir", desc: "Wilayah tertentu." },
              { icon: <Award className="text-[#F59E0B]" size={20} />, bg: "bg-yellow-50", title: "Garansi 100%", desc: "Cacat ganti baru." }
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

        {/* DESKTOP PROMO BANNERS SHOWCASE */}
        {banners.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider block mb-1">
                  PENAWARAN & PROMOSI PILIHAN
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B4B]">
                  Promo Spesial & Layanan Kilat Cetak.inc
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
                      className="relative rounded-3xl overflow-hidden bg-[#0B1E36] text-white p-6 flex flex-col justify-between min-h-[220px] border border-gray-100 shadow-md group"
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

        {/* CATEGORIES GRID SHOWCASE */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16 lg:mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <div className="inline-block bg-orange-100 text-[#F97316] font-bold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full mb-2">
                CHECKLIST CETAK & MERCHANDISE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
                Solusi Branding Cafe, Resto & Bisnis
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Pilihan lengkap dari branding outlet, packaging, crew uniform hingga merchandise kustom.
              </p>
            </div>
            <Link href="/produk" className="text-[#F97316] font-semibold text-sm hover:underline flex items-center gap-1">
              Buka Katalog Lengkap ({productList.length} Produk) <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayCategories.map((cat, idx) => (
              <Link
                key={cat.id || idx}
                href={cat.link}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cat.count}</span>
                    <div className="w-6 h-6 rounded-full bg-orange-50 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1E1B4B] text-base mb-1 group-hover:text-[#F97316] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* TOP SELLING PRODUCTS */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#1E1B4B] mb-2 flex items-center gap-2">
                Lagi Diskon Hari Ini <Zap className="text-[#F97316]" fill="currentColor" size={24} />
              </h2>
              <p className="text-gray-500 text-sm">Produk incaran dengan harga miring sebelum kehabisan!</p>
            </div>
            <Link href="/produk" className="text-[#F97316] font-semibold text-sm hover:underline flex items-center gap-1">
              Lihat Semua Produk <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {topSellingProducts.slice(0, 8).map((item) => (
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
        </section>

        {/* B2B PARTNERSHIP */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="bg-gradient-to-br from-[#272B70] to-[#1E1B4B] rounded-[2rem] p-8 lg:p-16 text-white relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-12 justify-between items-center">
            <div className="relative z-10 lg:w-[60%] w-full">
              <div className="inline-block bg-white/10 text-blue-300 font-bold text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 border border-white/10">
                PARTNERSHIP & B2B
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                Mitra Cetak Andal Untuk<br />
                <span className="text-[#FBBF24]">Event & Partai Besar</span>
              </h2>
              <p className="text-blue-100 text-base lg:text-lg max-w-xl mb-8 leading-relaxed opacity-90">
                Menjadi andalan para <strong>Event Organizer (EO)</strong> dan Perusahaan. Mesin industrial kami siap menjamin deadline ketat Anda terpenuhi.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-50">
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[#10B981]" /> Harga Grosir EO & B2B</div>
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[#10B981]" /> Garansi Selesai Tepat Waktu</div>
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[#10B981]" /> Kapasitas Skala Industrial</div>
                <div className="flex items-center gap-2"><CheckCircle size={18} className="text-[#10B981]" /> Gratis Proofing Warna</div>
              </div>
            </div>

            <div className="relative z-10 lg:w-[35%] flex flex-col gap-4 w-full">
              <Link 
                href="https://wa.me/6281234567890?text=Halo%20Tim%20Sales%20B2B,%20saya%20ingin%20konsultasi%20partai%20besar."
                target="_blank"
                className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold text-base py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                Hubungi Sales B2B Kami
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* 📱 PRODUCT BOTTOM SHEET MODAL (ALA GOJEK / ASTRO) */}
      <ProductBottomSheet
        product={sheetProduct}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

    </div>
  );
}
