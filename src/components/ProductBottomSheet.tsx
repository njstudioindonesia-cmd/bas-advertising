"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Link2, FileText, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductBottomSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductBottomSheet({ product, isOpen, onClose }: ProductBottomSheetProps) {
  const { addToCart, formatRupiah } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedBahan, setSelectedBahan] = useState("Standar");
  const [selectedFinishing, setSelectedFinishing] = useState("Standar");
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedBahan("Standar");
      setSelectedFinishing("Standar");
      setFileUrl("");
      setNotes("");
      setAdded(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const basePrice = Number(product.priceNumber) || 0;
  const totalPrice = basePrice * quantity;

  const handleAdd = () => {
    const fullNotes = [
      selectedBahan !== "Standar" ? `Bahan: ${selectedBahan}` : null,
      selectedFinishing !== "Standar" ? `Finishing: ${selectedFinishing}` : null,
      fileUrl ? `File Cetak: ${fileUrl}` : null,
      notes ? `Catatan: ${notes}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    addToCart(product, quantity, fullNotes, false);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* BOTTOM SHEET / MODAL CARD */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden"
        >
          {/* HEADER DENGAN HANDLE */}
          <div className="pt-3 pb-2 px-5 flex flex-col items-center border-b border-gray-100">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-3 sm:hidden" />
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#F97316] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
                {product.category || "Cetak.inc"}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="p-5 overflow-y-auto space-y-5 text-gray-800">
            {/* PRODUCT HERO SUMMARY */}
            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                <Image
                  src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
                  alt={product.name || product.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug line-clamp-2">
                  {product.name || product.title}
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-black text-lg text-[#F97316]">
                    {product.price}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {product.unit || "/ pcs"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                  {product.description || product.desc}
                </p>
              </div>
            </div>

            {/* PILIHAN BAHAN / VARIAN ALA ASTRO */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                Pilihan Bahan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Standar", "Premium Vinyl", "Waterproof Extra"].map((bahan) => (
                  <button
                    key={bahan}
                    type="button"
                    onClick={() => setSelectedBahan(bahan)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedBahan === bahan
                        ? "bg-orange-50 border-[#F97316] text-[#F97316] shadow-xs"
                        : "bg-gray-50/60 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {bahan}
                  </button>
                ))}
              </div>
            </div>

            {/* PILIHAN FINISHING / POTONG */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                Opsi Potong & Finishing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Standar", "Die-Cut (Putus)", "Laminasi Doff"].map((fin) => (
                  <button
                    key={fin}
                    type="button"
                    onClick={() => setSelectedFinishing(fin)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedFinishing === fin
                        ? "bg-orange-50 border-[#F97316] text-[#F97316] shadow-xs"
                        : "bg-gray-50/60 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {fin}
                  </button>
                ))}
              </div>
            </div>

            {/* LINK FILE SIAP CETAK (ALA CETAK MODERN) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                <Link2 size={13} className="text-[#F97316]" />
                Link File Desain Siap Cetak (Opsional)
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Paste link Google Drive, Canva, atau WeTransfer..."
                className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Pastikan akses link Google Drive diatur ke "Siapa saja yang memiliki link".
              </span>
            </div>

            {/* CATATAN CETAK */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                <FileText size={13} className="text-[#F97316]" />
                Catatan Khusus Operator Mesin
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tolong potong rounded corner 5mm, warna tajam..."
                className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all resize-none"
              />
            </div>
          </div>

          {/* BOTTOM BAR DENGAN STEPPER & CTA BUTTON */}
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            {/* STEPPER JUMLAH ALA ASTRO */}
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-90 transition-all"
              >
                <Minus size={15} />
              </button>
              <span className="w-10 text-center font-black text-sm text-gray-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-90 transition-all"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* CTA BUTTON */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={added}
              className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-[#F97316] text-white shadow-orange-500/30 hover:bg-[#ea580c]"
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Berhasil Masuk!
                </>
              ) : (
                <>
                  <span>+ Tambah</span>
                  <span>•</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
