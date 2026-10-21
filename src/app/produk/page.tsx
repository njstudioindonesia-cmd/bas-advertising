"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Check, X, Star, TrendingUp, Sparkles, Filter, Zap, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
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
  const [loading, setLoading] = useState(true);

  // Bottom sheet state
  const [sheetProduct, setSheetProduct] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch categories & products from DB API
  useEffect(() => {
    const loadCatalog = () => {
      const t = Date.now();
      Promise.all([
        fetch(`/api/categories?t=${t}`, { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] })),
        fetch(`/api/products?t=${t}`, { cache: "no-store" }).then(res => res.json()).catch(() => ({ data: [] }))
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
    return () => window.removeEventListener("bas_products_updated", handleUpdate);
  }, []);

  // Filter products by category & search
  const filteredProducts = productList.filter((item) => {
    const matchesCategory =
      activeCategory === "Semua" ||
      item.category === activeCategory ||
      item.categoryName === activeCategory;
    const matchesSearch =
      (item.name || item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || item.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-20 md:pt-36 pb-32">
      
      {/* 📱 TOP APP BAR ALA GOJEK/ASTRO */}
      <div className="sticky top-14 md:top-20 z-30 bg-[#F8F9FA]/95 backdrop-blur-md pt-2 pb-3 mb-4 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-[#F97316] flex items-center gap-1">
              <Zap size={11} className="fill-[#F97316]" /> Menu Cetak Cepat
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Katalog Produk Cetak.inc
            </h1>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-2xs">
            {filteredProducts.length} Produk
          </span>
        </div>

        {/* 📱 HORIZONTAL TOUCH SWIPEABLE CATEGORY CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3.5 px-3.5">
          {loading ? (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((cat) => {
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
            })
          )}
        </div>
      </div>

      {/* 🛍️ PRODUCT GRID (ALA ASTRO: 2-KOLOM MOBILE, 4-KOLOM DESKTOP) */}
      <section className="min-h-[50vh]">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-3 border border-gray-100 animate-pulse space-y-3">
                <div className="aspect-square bg-gray-100 rounded-2xl" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-8 space-y-3">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto shadow-xs">
              <Search size={28} />
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">Katalog Belum Ada Produk</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {productList.length === 0
                ? "Produk sedang dalam proses penataan oleh admin Cetak.inc. Silakan hubungi kami via WhatsApp untuk pemesanan kustom."
                : "Tidak ada produk yang cocok dengan kata kunci atau filter kategori yang dipilih."}
            </p>
            {productList.length > 0 ? (
              <button
                onClick={() => { setActiveCategory("Semua"); setSearchQuery(""); }}
                className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Tampilkan Semua Produk
              </button>
            ) : (
              <a
                href="https://wa.me/6281234567890?text=Halo%20Cetak.inc,%20saya%20ingin%20konsultasi%20pemesanan%20cetak"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-green-600 text-white transition-colors"
              >
                <MessageCircle size={15} /> Hubungi CS WhatsApp
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
