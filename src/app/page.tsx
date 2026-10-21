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

export default function Home() {
  const [productList, setProductList] = useState<any[]>(products);
  const [banners, setBanners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = () => {
      fetch("/api/products", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setProductList(data.data);
          }
        })
        .catch(() => {});

      fetch("/api/banners", { cache: "no-store" })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setBanners(data.data);
          }
        })
        .catch(() => {});
    };

    loadData();

    // Listen for product catalog updates from admin in same window or across tabs
    const handleUpdate = () => loadData();
    window.addEventListener("bas_products_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "bas_catalog_version") loadData();
    });

    return () => {
      window.removeEventListener("bas_products_updated", handleUpdate);
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

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-20 md:pt-36 pb-20 md:pb-24">

      {/* ======================================================== */}
      {/* 📱 MOBILE APP HOME EXPERIENCE (POTRAIT NATIVE APP FEEL) */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-4 px-3.5 max-w-lg mx-auto">
        
        {/* Mobile App Promo Banners (Horizontal Touch Swipe) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-1 pb-1">
          {/* Banner 1 */}
          <div className="min-w-[88%] snap-center rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#0B1E36] to-orange-950 p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
            <div className="relative z-10">
              <span className="bg-[#F97316] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-2xs">
                🔥 Promo Spesial BAS ADV
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

          {/* Banner 2 */}
          <div className="min-w-[88%] snap-center rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
            <div className="relative z-10">
              <span className="bg-white text-orange-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-2xs">
                ⚡ Kilat 24 Jam
              </span>
              <h2 className="font-extrabold text-base leading-tight">
                Cetak Banner & Spanduk <br />
                <span className="text-yellow-200">Selesai Hari Ini</span>
              </h2>
              <p className="text-[10px] text-orange-100 mt-1 line-clamp-1">
                Bahan Flexi Korea High Resolution anti pudar.
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <Link 
                href="/produk?q=Banner" 
                className="bg-[#1E1B4B] text-white text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-transform"
              >
                Cetak Kilat <ArrowRight size={12} />
              </Link>
              <span className="text-[9px] text-orange-100">Bisa Ditunggu</span>
            </div>
          </div>

          {/* Banner 3 */}
          <div className="min-w-[88%] snap-center rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
            <div className="relative z-10">
              <span className="bg-amber-400 text-slate-900 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1.5 shadow-2xs">
                🎨 Studio Preview
              </span>
              <h2 className="font-extrabold text-base leading-tight">
                Lihat Mockup Desain <br />
                <span className="text-emerald-300">Sebelum Dicetak</span>
              </h2>
              <p className="text-[10px] text-emerald-100 mt-1 line-clamp-1">
                Visualisasi 3D cup, totebag & packaging interaktif.
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <Link 
                href="/mockup" 
                className="bg-white text-emerald-900 text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 active:scale-95 transition-transform"
              >
                Buka Studio <ArrowRight size={12} />
              </Link>
              <span className="text-[9px] text-emerald-200">Gratis Simulasi</span>
            </div>
          </div>
        </div>

        {/* 8 Mobile App Category Icons Grid */}
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100/90 shadow-2xs">
          <div className="grid grid-cols-4 gap-3 text-center">
            {mobileAppCategories.map((item, idx) => {
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
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100/90 shadow-2xs flex flex-col justify-between relative group"
              >
                <Link href={`/produk/${item.id}`} className="block">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                    {item.isBestSeller && (
                      <span className="absolute top-1.5 left-1.5 bg-[#FF3E6C] text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-2xs">
                        Terlaris
                      </span>
                    )}
                  </div>

                  <div className="p-2.5">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1.5">
                      {item.title}
                    </h4>

                    {item.normalPrice && (
                      <span className="text-[9px] text-gray-400 line-through block">
                        {item.normalPrice}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-[#F97316]">{item.price}</span>
                      <span className="text-[8px] text-gray-400">{item.unit}</span>
                    </div>

                    <div className="flex items-center text-[#F59E0B] text-[9px] mt-1">
                      <Star size={10} fill="currentColor" />
                      <span className="ml-1 text-gray-700 font-bold">{item.rating}</span>
                      <span className="text-gray-300 mx-1">·</span>
                      <span className="text-gray-400">{item.sold}</span>
                    </div>
                  </div>
                </Link>

                <div className="px-2.5 pb-2.5">
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(item, e)}
                    className={`w-full py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs ${
                      addedId === item.id
                        ? "bg-green-600 text-white"
                        : "bg-orange-50 text-[#F97316] hover:bg-[#F97316] hover:text-white border border-orange-200/50"
                    }`}
                  >
                    {addedId === item.id ? <Check size={12} /> : <Plus size={12} />}
                    <span>{addedId === item.id ? "Berhasil!" : "+ Keranjang"}</span>
                  </button>
                </div>
              </div>
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
                alt="Fasilitas percetakan modern Pusat Cetak Padang" 
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
            {[
              { title: "Branding Outlet", count: "9 Produk", link: "/produk?category=Branding+Outlet", desc: "Sticker kaca, wall graphic, X-banner, signage" },
              { title: "Branding Meja", count: "7 Produk", link: "/produk?category=Branding+Meja", desc: "Table number, table tent, menu cetak, coaster" },
              { title: "Packaging Makanan", count: "14 Produk", link: "/produk?category=Packaging", desc: "Paper cup, plastic cup, food box, paper bag" },
              { title: "Crew Uniform & ID", count: "6 Produk", link: "/produk?category=Crew", desc: "Kaos crew, hoodie, apron barista, name tag" },
              { title: "Marketing & Promosi", count: "11 Produk", link: "/produk?category=Marketing", desc: "Flyer, brosur, voucher, member card, tiket" },
              { title: "Barang Cetak Kantor", count: "8 Produk", link: "/produk?category=Barang+Cetak+Pendukung", desc: "Nota NCR, kop surat, amplop, kartu nama" },
              { title: "Merchandise & Aksesoris", count: "29 Produk", link: "/produk?category=Merchandise", desc: "Tote bag, tumbler, topi, mug, cardholder" },
              { title: "Outdoor & Signage", count: "5 Produk", link: "/produk?category=Outdoor+%26+Signage", desc: "Spanduk flexi Korea, neon box, huruf timbul" }
            ].map((cat, idx) => (
              <Link
                key={idx}
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
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 flex flex-col group relative transition-all"
              >
                <Link href={`/produk/${item.id}`} className="flex-grow flex flex-col">
                  <div className="absolute top-0 right-0 bg-[#EF4444] text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                    Diskon 25%
                  </div>

                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image 
                      src={item.img || (item as any).imageUrl} 
                      alt={item.title} 
                      fill 
                      sizes="25vw"
                      unoptimized={Boolean((item.img || (item as any).imageUrl)?.startsWith("data:"))}
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    {item.isBestSeller && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#FF3E6C] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                          <TrendingUp size={12} /> Terlaris
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-semibold text-[#1E1B4B] mb-2 line-clamp-2 group-hover:text-[#F97316] transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="mt-auto mb-2 flex flex-col">
                      {item.normalPrice && (
                        <span className="text-xs text-gray-400 line-through font-medium">{item.normalPrice}</span>
                      )}
                      <div className="flex items-end gap-1">
                        <span className="text-xl font-bold text-[#F97316]">{item.price}</span>
                        <span className="text-xs text-gray-500 mb-0.5">{item.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs font-medium text-gray-500 pt-3 border-t border-gray-50">
                      <div className="flex items-center text-[#F59E0B]">
                        <Star size={14} fill="currentColor" />
                        <span className="ml-1 text-gray-700 font-bold">{item.rating}</span>
                      </div>
                      <span>{item.sold}</span>
                    </div>
                  </div>
                </Link>

                <div className="p-3 pt-0">
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(item, e)}
                    className="w-full py-2 bg-orange-50 hover:bg-[#F97316] text-[#F97316] hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> + Keranjang
                  </button>
                </div>
              </div>
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

    </div>
  );
}
