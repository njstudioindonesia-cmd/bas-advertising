"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function FloatingCartBar() {
  const pathname = usePathname();
  const { totalItems, subtotal, formatRupiah, isLoaded } = useCart();

  // Jangan tampilkan jika keranjang kosong atau sedang berada di halaman checkout / admin / invoice
  if (
    !isLoaded ||
    totalItems === 0 ||
    pathname === "/keranjang" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/urang-dalam-bas-adv") ||
    pathname?.startsWith("/invoice")
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Keranjang Belanja Mengambang"
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed z-40 left-3 right-3 sm:left-auto sm:right-6 bottom-16 md:bottom-6 sm:w-[420px]"
      >
        <Link
          href="/keranjang"
          className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-gray-700/60 hover:border-orange-500/60 transition-all active:scale-[0.98]"
        >
          {/* SISI KIRI: IKON & TOTAL */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
              <ShoppingBag size={20} className="transition-transform group-hover:scale-110" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[#F97316] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1E293B] shadow-sm">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-300 font-medium">{totalItems} Pesanan</span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-orange-400 font-bold flex items-center gap-0.5">
                  <Zap size={11} className="fill-orange-400" /> Kilat
                </span>
              </div>
              <div className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                {formatRupiah(subtotal)}
              </div>
            </div>
          </div>

          {/* SISI KANAN: TOMBOL LANJUT BAYAR ALA ASTRO */}
          <div className="flex items-center gap-1.5 bg-[#F97316] text-white font-bold text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md group-hover:bg-[#ea580c] transition-colors shrink-0">
            <span>Lanjut Bayar</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </motion.aside>
    </AnimatePresence>
  );
}
