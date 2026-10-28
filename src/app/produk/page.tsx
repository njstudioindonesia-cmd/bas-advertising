"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, X, Star, TrendingUp, Sparkles, Filter, Zap, MessageCircle } from "lucide-react";
import QuickProductCard from "@/components/QuickProductCard";
import ProductBottomSheet from "@/components/ProductBottomSheet";

const DEFAULT_CATEGORIES = ["Semua"];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Semua";
  
  const [productList, setProductList] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [whatsappNumber, setWhatsappNumber] = useState("6282172725267");
  const [loading, setLoading] = useState(true);

  // Bottom sheet state
  const [sheetProduct, setSheetProduct] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch settings for dynamic WhatsApp CS
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data["contact.whatsapp"]) {
          setWhatsappNumber(String(data.data["contact.whatsapp"]).replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch categories & products from DB API
  useEffect(() => {
    const loadCatalog = () => {
      const ts = Date.now();
      Promise.all([
        fetch(`/api/categories?t=${ts}`, { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`/api/products?t=${ts}`, { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] }))
      ]).then(([catData, prodData]) => {
        if (catData.success && Array.isArray(catData.data) && catData.data.length > 0) {
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
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "bas_catalog_version") loadCatalog();
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("bas_catalog_sync");
      bc.onmessage = () => loadCatalog();
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("bas_products_updated", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      try {
        bc?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  let cleanWa = whatsappNumber;
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  // Filter products by category & search
  const filteredProducts = productList.filter((item) => {
    const matchesCategory =
      activeCategory === "Semua" ||
      item.category === activeCategory ||
      item.categoryName === activeCategory ||
      (item.category && item.category.toLowerCase() === activeCategory.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase()));
    const matchesSearch =
      (item.name || item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || item.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-lg md:max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-24 md:pb-32 overflow-x-hidden">
      
      {/* 📱 TOP APP BAR CLEAN & MINIMALIST */}
      <div className="sticky top-14 md:top-20 z-20 bg-white/95 backdrop-blur-md pt-2 pb-3 mb-3 border-b border-neutral-200/60 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-400">
                Percetakan & Advertising Studio
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              {activeCategory === "Semua" ? "Katalog Produk" : (activeCategory === "PACKAGING" ? "Packaging" : activeCategory)}
            </h1>
          </div>
          <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full shrink-0 border border-neutral-200/60 shadow-2xs">
            {filteredProducts.length} Produk
          </span>
        </div>

        {/* 🔍 SEARCH CAPSULE INPUT */}
        <div className="relative mb-2.5">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk cetak (contoh: spanduk, stiker, box, jersey)..."
            className="w-full pl-9 pr-8 py-2 bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white text-xs rounded-2xl border border-neutral-200/70 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 📱 HORIZONTAL TOUCH SWIPEABLE CATEGORY CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full max-w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 w-20 bg-neutral-200/70 rounded-full animate-pulse shrink-0" />
              ))}
            </div>
          ) : (
            categories.map((cat) => {
              const isSelected = activeCategory === cat;
              const displayName = cat === "PACKAGING" ? "Packaging" : cat === "SPANDUK" ? "Spanduk" : cat === "STIKER" ? "Stiker" : cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
                    isSelected 
                      ? "bg-neutral-900 text-white shadow-sm scale-105" 
                      : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {displayName}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 🛍️ PRODUCT GRID */}
      <section className="min-h-[50vh] w-full max-w-full">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full min-w-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="bg-neutral-100 rounded-3xl aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-neutral-50 rounded-3xl p-8 text-center border border-neutral-200/60 max-w-md mx-auto my-6 space-y-3">
            <div className="w-12 h-12 bg-neutral-200/80 rounded-2xl flex items-center justify-center text-neutral-600 mx-auto">
              <Search size={22} />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm sm:text-base">Katalog Belum Ada Produk</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {productList.length === 0
                ? "Produk sedang dalam proses penataan oleh admin Cetak.inc. Silakan hubungi kami via WhatsApp untuk pemesanan kustom."
                : "Tidak ada produk yang cocok dengan kata kunci atau filter kategori yang dipilih."}
            </p>
            {productList.length > 0 ? (
              <button
                onClick={() => { setActiveCategory("Semua"); setSearchQuery(""); }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
              >
                Tampilkan Semua Produk
              </button>
            ) : (
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent("Halo Cetak.inc, saya ingin konsultasi pemesanan produk cetak.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              >
                <MessageCircle size={14} /> Hubungi CS WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full min-w-0">
            {filteredProducts.map((item) => (
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
      </section>

      {/* 📱 PRODUCT BOTTOM SHEET MODAL */}
      <ProductBottomSheet
        product={sheetProduct}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Memuat katalog cetak...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
