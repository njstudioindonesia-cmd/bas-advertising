"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, FileText, Sparkles, ShieldCheck, Ruler, MessageCircle } from "lucide-react";

interface ProductBottomSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductBottomSheet({ product, isOpen, onClose }: ProductBottomSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedBahan, setSelectedBahan] = useState("Standar");
  const [selectedFinishing, setSelectedFinishing] = useState("Standar");
  const [notes, setNotes] = useState("");
  const [waNumber, setWaNumber] = useState("6282172725267");

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
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data["contact.whatsapp"]) {
          setWaNumber(String(data.data["contact.whatsapp"]).replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedBahan("Standar");
      setSelectedFinishing(isMeterProduct ? "Mata Ayam Tiap Sudut" : "Standar");
      setNotes("");
      setPanjang(2);
      setLebar(1);
      setSelectedPreset("2x1");
    }
  }, [product, isMeterProduct]);

  if (!isOpen || !product) return null;

  // Hitung Luas & Harga
  const basePrice = Number(product.priceNumber) || 0;
  const rawLuas = isMeterProduct ? panjang * lebar : 1;
  const luas = isMeterProduct ? Math.max(1, Math.round(rawLuas * 100) / 100) : 1;
  const unitPrice = isMeterProduct ? Math.round(basePrice * luas) : basePrice;
  const totalPrice = unitPrice * quantity;

  const handlePresetClick = (p: number, l: number, label: string) => {
    setPanjang(p);
    setLebar(l);
    setSelectedPreset(label);
  };

  const handleOrderWhatsApp = () => {
    let cleanWa = waNumber;
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    } else if (!cleanWa.startsWith("62")) {
      cleanWa = "62" + cleanWa;
    }

    const title = product.name || product.title;
    let msg = `*HALO CETAK.INC, SAYA INGIN PESAN:*\n`;
    msg += `----------------------------------------\n`;
    msg += `📦 *Produk:* ${title}\n`;
    msg += `🏷️ *Kategori:* ${product.category || "Umum"}\n`;

    if (isMeterProduct) {
      msg += `📐 *Ukuran:* ${panjang}m x ${lebar}m (${luas} m²)\n`;
    }
    if (selectedBahan && selectedBahan !== "Standar") {
      msg += `🧵 *Bahan:* ${selectedBahan}\n`;
    }
    if (selectedFinishing && selectedFinishing !== "Standar") {
      msg += `✂️ *Finishing:* ${selectedFinishing}\n`;
    }

    msg += `🔢 *Jumlah:* ${quantity} pcs\n`;
    if (totalPrice > 0) {
      msg += `💰 *Estimasi Total:* Rp ${totalPrice.toLocaleString("id-ID")}\n`;
    }
    if (notes) {
      msg += `📝 *Catatan:* ${notes}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `Mohon info ketersediaan dan cara kirim file desainnya. Terima kasih!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/60 shrink-0">
                <Image
                  src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
                  alt={product.name || product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 block truncate">
                  {product.category || "Cetak.inc"}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 leading-tight truncate">
                  {product.name || product.title}
                </h3>
                <span className="text-xs font-bold text-emerald-600">
                  {isMeterProduct
                    ? `Rp ${unitPrice.toLocaleString("id-ID")} (${luas} m²)`
                    : product.price}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex items-center justify-center active:scale-90 transition-transform"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            {/* Meter Calculator jika produk spanduk/banner */}
            {isMeterProduct && (
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                    <Ruler size={13} className="text-neutral-600" /> Ukuran Spanduk (P × L):
                  </span>
                  <span className="font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-full border border-neutral-200 shadow-2xs">
                    {panjang}m × {lebar}m = {luas} m²
                  </span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "2x1 m", p: 2, l: 1 },
                    { label: "3x1 m", p: 3, l: 1 },
                    { label: "4x1 m", p: 4, l: 1 },
                    { label: "3x2 m", p: 3, l: 2 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset.p, preset.l, preset.label)}
                      className={`px-2.5 py-1 rounded-lg font-medium text-[10px] transition-all ${
                        selectedPreset === preset.label
                          ? "bg-neutral-900 text-white shadow-2xs"
                          : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-1">Panjang (Meter)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.1}
                      value={panjang}
                      onChange={(e) => {
                        setPanjang(Math.max(0.1, parseFloat(e.target.value) || 1));
                        setSelectedPreset("custom");
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-neutral-200 font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-neutral-600 block mb-1">Lebar (Meter)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.1}
                      value={lebar}
                      onChange={(e) => {
                        setLebar(Math.max(0.1, parseFloat(e.target.value) || 1));
                        setSelectedPreset("custom");
                      }}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-neutral-200 font-semibold text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pilihan Finishing */}
            <div>
              <label className="font-semibold text-neutral-800 block mb-1.5">Finishing:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Standar",
                  "Mata Ayam Tiap Sudut",
                  "Lipat Saja (Tanpa Ring)",
                  "Potong Pas (Cut)",
                ].map((fin) => (
                  <button
                    key={fin}
                    type="button"
                    onClick={() => setSelectedFinishing(fin)}
                    className={`p-2.5 rounded-xl text-left font-medium text-[11px] border transition-all ${
                      selectedFinishing === fin
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {fin}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan Khusus */}
            <div>
              <label className="font-semibold text-neutral-800 block mb-1">Catatan Tambahan (Opsional):</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tambahkan teks 'Promo Ramadhan', warna dominan merah, dll."
                className="w-full p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:bg-white focus:outline-none focus:border-neutral-900 transition-all text-xs"
              />
            </div>

            {/* Jumlah Quantity */}
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <span className="font-semibold text-neutral-800">Jumlah Pesanan:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center font-bold active:scale-90 transition-transform shadow-2xs"
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-sm w-8 text-center text-neutral-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white border border-neutral-200 text-neutral-800 flex items-center justify-center font-bold active:scale-90 transition-transform shadow-2xs"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-neutral-100 bg-white shrink-0 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block leading-tight">Total Estimasi:</span>
              <span className="text-base font-bold text-neutral-900">
                {totalPrice > 0 ? `Rp ${totalPrice.toLocaleString("id-ID")}` : product.price}
              </span>
            </div>

            <button
              onClick={handleOrderWhatsApp}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <MessageCircle size={18} />
              <span>Pesan via WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
