"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, X, Star, TrendingUp } from "lucide-react";
import { useCart } from "@/context/CartContext";

const DEFAULT_CATEGORIES = [
  "Semua",
  "Branding Outlet",
  "Branding Meja",
  "Packaging",
  "Crew",
  "Marketing",
  "Barang Cetak Pendukung",
  "Merchandise",
  "Outdoor & Signage"
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Semua";
  
  const [productList, setProductList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Fetch categories & products from DB API
  useEffect(() => {
    const loadCatalog = () => {
      Promise.all([
        fetch("/api/categories", { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] })),
        fetch("/api/products", { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] }))
      ]).then(([catData, prodData]) => {
        if (catData.success && Array.isArray(catData.data)) {
          const catNames = ["Semua", ...catData.data.map((c: any) => c.name)];
          setCategories(catNames);
        }
        if (prodData.success && Array.isArray(prodData.data)) {
          setProductList(prodData.data);
        }
        setLoading(false);
      });
    };

    loadCatalog();

    const handleUpdate = () => loadCatalog();
    window.addEventListener("bas_products_updated", handleUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "bas_catalog_version") loadCatalog();
    });

    return () => {
      window.removeEventListener("bas_products_updated", handleUpdate);
    };
  }, []);

  // Update if URL parameter changes
  useEffect(() => {
    if (searchParams.get("q") !== null) {
      setSearchQuery(searchParams.get("q") || "");
    }
    if (searchParams.get("category")) {
      setActiveCategory(searchParams.get("category") || "Semua");
    }
  }, [searchParams]);

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filteredProducts = productList.filter((product) => {
    const matchesCategory = activeCategory === "Semua" || product.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const title = (product.title || product.name || "").toLowerCase();
    const desc = (product.desc || product.description || "").toLowerCase();
    const cat = (product.category || "").toLowerCase();
    const matchesSearch = title.includes(q) || desc.includes(q) || cat.includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-20 md:pt-36 pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
      
      {/* 📱 MOBILE APP TOP BAR / SEARCH */}
      <div className="mb-4">
        {/* Title & Badge */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider block">
              Pusat Cetak Padang
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#1E1B4B] tracking-tight">
              Katalog Produk Cetak
            </h1>
          </div>
          <span className="text-xs bg-white px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 font-medium shadow-2xs">
            {filteredProducts.length} Produk
          </span>
        </div>

        {/* Search input with reset button */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Cari stiker, cup, kaos, tumbler, nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-9 py-2.5 sm:py-3.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-orange-100 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* 📱 HORIZONTAL TOUCH SWIPEABLE CATEGORY CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3.5 px-3.5">
          {categories.map((cat) => {
            const count = cat === "Semua" ? productList.length : productList.filter(p => p.category === cat).length;
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  isSelected 
                    ? "bg-[#1E1B4B] text-white shadow-xs" 
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-2xs"
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-[#F97316] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🛍️ PRODUCT GRID (2-COLUMNS ON MOBILE PORTRAIT) */}
      <section className="min-h-[50vh]">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-3 border border-gray-100 animate-pulse space-y-3">
                <div className="aspect-square bg-gray-100 rounded-xl" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto mb-3">
              <Search size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500 mb-4">
              Coba gunakan kata kunci lain atau pilih kategori "Semua".
            </p>
            <button
              onClick={() => { setActiveCategory("Semua"); setSearchQuery(""); }}
              className="bg-[#1E1B4B] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((item, idx) => {
                const imgUrl = item.imageUrl || item.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop";
                const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.priceNumber;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    key={item.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg border border-gray-100/90 flex flex-col group relative transition-all"
                  >
                    <Link href={`/produk/${item.id}`} className="flex-grow flex flex-col">
                      {hasDiscount && (
                        <div className="absolute top-0 right-0 bg-[#EF4444] text-white text-[9px] sm:text-xs font-extrabold px-2 py-0.5 rounded-bl-lg z-10 shadow-2xs">
                          PROMO
                        </div>
                      )}

                      {/* Image */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <Image 
                          src={imgUrl} 
                          alt={item.title || item.name} 
                          fill 
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        
                        {item.isBestSeller && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-[#FF3E6C] text-white text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-2xs flex items-center gap-0.5">
                              <TrendingUp size={9} /> Terlaris
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-2.5 sm:p-4 flex-grow flex flex-col">
                        <span className="text-[8px] sm:text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5">
                          {item.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-semibold text-[#1E1B4B] mb-1 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
                          {item.title || item.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="mt-auto mb-1 flex flex-col">
                          {item.normalPrice && (
                            <span className="text-[9px] sm:text-xs text-gray-400 line-through font-medium">
                              {item.normalPrice}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-lg font-black text-[#F97316]">{item.price}</span>
                            <span className="text-[8px] sm:text-xs text-gray-400">{item.unit || "/ pcs"}</span>
                          </div>
                        </div>
                        
                        {/* Rating & Sold */}
                        <div className="flex items-center text-[#F59E0B] text-[9px] sm:text-xs pt-1.5 border-t border-gray-50">
                          <Star size={10} fill="currentColor" />
                          <span className="ml-1 text-gray-700 font-bold">{item.rating || "5.0"}</span>
                          <span className="text-gray-300 mx-1">·</span>
                          <span className="text-gray-400">Terjual {item.sold || "100+"}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Quick Add to Cart Button */}
                    <div className="px-2.5 pb-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(item, e)}
                        className={`w-full py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs ${
                          addedId === item.id
                            ? "bg-green-600 text-white"
                            : "bg-orange-50 hover:bg-[#F97316] text-[#F97316] hover:text-white border border-orange-200/50"
                        }`}
                      >
                        {addedId === item.id ? <Check size={13} /> : <Plus size={13} />}
                        <span>{addedId === item.id ? "Masuk Keranjang!" : "+ Keranjang"}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

    </div>
  );
}

export default function Produk() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Suspense fallback={<div className="pt-32 text-center text-gray-400 text-sm">Memuat katalog produk...</div>}>
        <CatalogContent />
      </Suspense>
    </div>
  );
}
