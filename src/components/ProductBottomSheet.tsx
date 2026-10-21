"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Check, Link2, FileText, Sparkles, ShieldCheck, Zap, Calculator, Ruler } from "lucide-react";
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

  // State Kalkulator Ukuran Kustom (Panjang x Lebar) untuk Spanduk & Banner
  const isMeterProduct = Boolean(
    product &&
    (
      (product.unit && product.unit.toLowerCase().includes("meter")) ||
      (product.category && /spanduk|banner|baliho|outdoor|backdrop/i.test(product.category)) ||
      (product.name && /spanduk|banner|baliho|backdrop/i.test(product.name))
    )
  );

  const [panjang, setPanjang] = useState<number>(2);
  const [lebar, setLebar] = useState<number>(1);
  const [selectedPreset, setSelectedPreset] = useState<string>("2x1");

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedBahan("Standar");
      setSelectedFinishing(isMeterProduct ? "Mata Ayam Tiap Sudut" : "Standar");
      setFileUrl("");
      setNotes("");
      setAdded(false);
      setPanjang(2);
      setLebar(1);
      setSelectedPreset("2x1");
    }
  }, [product, isMeterProduct]);

  if (!isOpen || !product) return null;

  // Hitung Luas & Harga
  const basePrice = Number(product.priceNumber) || 0;
  
  // Aturan percetakan: luas dihitung P x L, minimal dihitung 1 m²
  const rawLuas = isMeterProduct ? panjang * lebar : 1;
  const luas = isMeterProduct ? Math.max(1, Math.round(rawLuas * 100) / 100) : 1;
  const unitPrice = isMeterProduct ? Math.round(basePrice * luas) : basePrice;
  const totalPrice = unitPrice * quantity;

  const handlePresetClick = (p: number, l: number, label: string) => {
    setPanjang(p);
    setLebar(l);
    setSelectedPreset(label);
  };

  const handleAdd = () => {
    const dimensionNote = isMeterProduct 
      ? `Ukuran: ${panjang}m x ${lebar}m (${luas} m²)` 
      : null;

    const fullNotes = [
      dimensionNote,
      selectedBahan !== "Standar" ? `Bahan: ${selectedBahan}` : null,
      selectedFinishing !== "Standar" ? `Finishing: ${selectedFinishing}` : null,
      fileUrl ? `File Cetak: ${fileUrl}` : null,
      notes ? `Catatan: ${notes}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // Custom product payload dengan harga per unit yang sudah dikalikan luas m²
    const customizedProduct = isMeterProduct
      ? {
          ...product,
          price: formatRupiah(unitPrice),
          priceNumber: unitPrice,
          unit: `/ ${panjang}x${lebar}m`,
        }
      : product;

    addToCart(customizedProduct, quantity, fullNotes, false);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 600);
  };

  const FINISHING_OPTIONS = isMeterProduct
    ? [
        "Mata Ayam Tiap Sudut",
        "Mata Ayam Keliling",
        "Selongsong Atas-Bawah",
        "Lipat Lem Rapi",
        "Potong Pas Gambar",
      ]
    : [
        "Standar",
        "Die-Cut (Putus)",
        "Laminasi Doff",
        "Laminasi Glossy",
      ];

  const BAHAN_OPTIONS = isMeterProduct
    ? [
        "Flexi China 280g (Standar)",
        "Flexi Korea 380g (Tebal)",
        "Flexi Jerman 440g (Super Awet)",
      ]
    : [
        "Standar",
        "Premium Vinyl",
        "Waterproof Extra",
      ];

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
              <span className="text-[11px] font-black uppercase tracking-wider text-[#F97316] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60 flex items-center gap-1">
                <Sparkles size={11} className="text-[#F97316]" />
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
                    {formatRupiah(unitPrice)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {isMeterProduct ? `(${luas} m²)` : (product.unit || "/ pcs")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                  {product.description || product.desc || "Solusi cetak cepat dan berkualitas Cetak.inc Padang."}
                </p>
              </div>
            </div>

            {/* 📐 KALKULATOR UKURAN SPANDUK & STIKER METERAN */}
            {isMeterProduct && (
              <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                    <Calculator size={14} className="text-[#F97316]" />
                    Kalkulator Ukuran Cetak
                  </span>
                  <span className="text-[11px] font-extrabold text-[#F97316] bg-white px-2 py-0.5 rounded-md shadow-2xs border border-orange-200">
                    Luas: {luas} m²
                  </span>
                </div>

                {/* Preset Ukuran Populer */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { p: 1, l: 1, label: "1x1m" },
                    { p: 2, l: 1, label: "2x1m" },
                    { p: 3, l: 1, label: "3x1m" },
                    { p: 3, l: 2, label: "3x2m" },
                    { p: 4, l: 1, label: "4x1m" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset.p, preset.l, preset.label)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                        selectedPreset === preset.label
                          ? "bg-[#F97316] text-white border-[#F97316] shadow-xs"
                          : "bg-white text-gray-700 border-orange-200/80 hover:bg-orange-100/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Input Manual Panjang x Lebar */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-1">
                      Panjang (meter)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="50"
                        value={panjang}
                        onChange={(e) => {
                          setPanjang(parseFloat(e.target.value) || 1);
                          setSelectedPreset("custom");
                        }}
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-black text-gray-900 focus:outline-none focus:border-[#F97316]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">m</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-700 block mb-1">
                      Lebar (meter)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="5"
                        value={lebar}
                        onChange={(e) => {
                          setLebar(parseFloat(e.target.value) || 1);
                          setSelectedPreset("custom");
                        }}
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs font-black text-gray-900 focus:outline-none focus:border-[#F97316]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">m</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-tight">
                  *Rumus: {panjang}m × {lebar}m = {rawLuas.toFixed(2)} m² (dihitung {luas} m²).
                </p>
              </div>
            )}

            {/* PILIHAN BAHAN / VARIAN */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                Pilihan Bahan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BAHAN_OPTIONS.map((bahan) => (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FINISHING_OPTIONS.map((fin) => (
                  <button
                    key={fin}
                    type="button"
                    onClick={() => setSelectedFinishing(fin)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center leading-tight ${
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
                placeholder="Contoh: Mata ayam tiap sudut 4 titik, warna tajam kontras..."
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
