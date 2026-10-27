"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Plus, 
  Minus, 
  Ruler, 
  MessageCircle, 
  CheckCircle2, 
  FileText,
  Sparkles
} from "lucide-react";

interface ProductBottomSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductBottomSheet({ product, isOpen, onClose }: ProductBottomSheetProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFinishing, setSelectedFinishing] = useState("Standar");
  const [notes, setNotes] = useState("");
  const [waNumber, setWaNumber] = useState("6282172725267");

  // State Kalkulator Ukuran Kustom (Panjang x Lebar) untuk Spanduk, Banner, Signage
  const isMeterProduct = Boolean(
    product &&
    (
      (product.unit && product.unit.toLowerCase().includes("meter")) ||
      (product.category && /spanduk|banner|baliho|outdoor|backdrop|signage|neon/i.test(product.category)) ||
      (product.name && /spanduk|banner|baliho|backdrop|neon box/i.test(product.name))
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

  // Finishing yang cerdas sesuai kategori produk
  const getFinishingOptions = (prod: any) => {
    if (!prod) return [];
    const cat = (prod.category || "").toLowerCase();
    const name = (prod.name || prod.title || "").toLowerCase();

    if (/stiker|sticker|label/i.test(cat) || /stiker|sticker|label/i.test(name)) {
      return [
        { name: "Kiss Cut (Lembaran)", desc: "Tinggal kelupas praktis" },
        { name: "Die Cut (Satuan)", desc: "Potong lepas per pcs" },
        { name: "Laminasi Glossy", desc: "Kilap tahan air & minyak" },
        { name: "Laminasi Doff", desc: "Matte mewah & elegan" },
      ];
    }
    if (/packaging|box|kemasan/i.test(cat) || /packaging|box|kemasan/i.test(name)) {
      return [
        { name: "Pond & Lipat Standar", desc: "Bentuk presisi & rapi" },
        { name: "Laminasi Foodgrade", desc: "Aman kontak makanan" },
        { name: "Tingkap Mika (Window)", desc: "Produk terlihat jelas" },
        { name: "Kunci Selip Otomatis", desc: "Kuat tanpa perlu lem" },
      ];
    }
    if (/kaos|sablon|baju|merchandise/i.test(cat) || /kaos|sablon|baju|merchandise/i.test(name)) {
      return [
        { name: "Sablon Depan Saja", desc: "DTF Full Color tajam" },
        { name: "Depan & Belakang", desc: "Dua sisi cetak presisi" },
        { name: "Tambah Logo Lengan", desc: "Aksen seragam crew" },
        { name: "Plastik Satuan", desc: "Packing siap distribusi" },
      ];
    }
    if (/signage|neon|akrilik|plang/i.test(cat) || /signage|neon|akrilik|plang/i.test(name)) {
      return [
        { name: "Lampu LED Hemat Daya", desc: "Cahaya terang merata" },
        { name: "Braket Tempel Samping", desc: "Kokoh di dinding toko" },
        { name: "Dua Sisi (Bolak-Balik)", desc: "Terlihat dari 2 arah" },
        { name: "Satu Sisi (Backdrop)", desc: "Tempel rata dinding" },
      ];
    }
    if (/spanduk|banner|baliho|backdrop/i.test(cat) || /spanduk|banner|baliho|backdrop/i.test(name)) {
      return [
        { name: "Mata Ayam Tiap Sudut", desc: "Ring besi di 4 sudut" },
        { name: "Mata Ayam Keliling", desc: "Ring besi tiap 50 cm" },
        { name: "Lipat Pres (Tanpa Ring)", desc: "Tepi rapi dilem panas" },
        { name: "Potong Pas (Cut)", desc: "Rata tepi pas gambar" },
      ];
    }

    return [
      { name: "Standar Berkualitas", desc: "Spesifikasi terbaik" },
      { name: "Finishing Kustom via WA", desc: "Sesuai kebutuhan spesifik" },
    ];
  };

  const finishingOptions = getFinishingOptions(product);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      const defaultFin = finishingOptions.length > 0 ? finishingOptions[0].name : "Standar";
      setSelectedFinishing(defaultFin);
      setNotes("");
      setPanjang(2);
      setLebar(1);
      setSelectedPreset("2x1");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Hitung Luas & Harga
  const basePrice = Number(product.priceNumber) || 0;
  const rawLuas = isMeterProduct ? panjang * lebar : 1;
  const luas = isMeterProduct ? Math.max(0.5, Math.round(rawLuas * 100) / 100) : 1;
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
      msg += `📐 *Ukuran:* ${panjang}m × ${lebar}m (${luas} m²)\n`;
    }
    if (selectedFinishing) {
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
    msg += `Mohon info ketersediaan dan panduan kirim file desainnya. Terima kasih!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop dengan blur lembut */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Sheet Modern */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 border-t border-neutral-200/50"
        >
          {/* Top Indicator Handle (Native Mobile App Style) */}
          <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

          {/* Header */}
          <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shrink-0 shadow-2xs">
                <Image
                  src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
                  alt={product.name || product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block truncate">
                  {product.category || "Cetak.inc"}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-snug truncate">
                  {product.name || product.title}
                </h3>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                    {isMeterProduct
                      ? `Rp ${unitPrice.toLocaleString("id-ID")}`
                      : product.price}
                  </span>
                  {isMeterProduct && (
                    <span className="text-[10px] text-neutral-400 font-medium">
                      ({luas} m²)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 hover:text-neutral-900 flex items-center justify-center active:scale-90 transition-transform shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Options */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs no-scrollbar">
            {/* Kalkulator Dimensi Ukuran jika produk bersatuan Meter/Luas */}
            {isMeterProduct && (
              <div className="p-4 bg-neutral-50/90 rounded-2xl border border-neutral-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                    <Ruler size={14} className="text-neutral-500" /> Dimensi Ukuran (P × L):
                  </span>
                  <span className="font-extrabold text-neutral-900 bg-white px-2.5 py-1 rounded-full border border-neutral-200/80 shadow-2xs text-[11px]">
                    {panjang}m × {lebar}m = {luas} m²
                  </span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "2 × 1 m", p: 2, l: 1 },
                    { label: "3 × 1 m", p: 3, l: 1 },
                    { label: "4 × 1 m", p: 4, l: 1 },
                    { label: "3 × 2 m", p: 3, l: 2 },
                  ].map((preset) => {
                    const isPresetSelected = selectedPreset === preset.label;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePresetClick(preset.p, preset.l, preset.label)}
                        className={`px-3 py-1.5 rounded-full font-semibold text-[11px] transition-all active:scale-95 ${
                          isPresetSelected
                            ? "bg-neutral-950 text-white shadow-2xs"
                            : "bg-white text-neutral-700 border border-neutral-200/80 hover:bg-neutral-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Inputs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 block mb-1">
                      Panjang (P)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0.5}
                        step={0.1}
                        value={panjang}
                        onChange={(e) => {
                          setPanjang(Math.max(0.1, parseFloat(e.target.value) || 1));
                          setSelectedPreset("custom");
                        }}
                        className="w-full pl-3 pr-8 py-2 bg-white rounded-xl border border-neutral-200/90 font-bold text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-xs pointer-events-none">
                        meter
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-600 block mb-1">
                      Lebar (L)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0.5}
                        step={0.1}
                        value={lebar}
                        onChange={(e) => {
                          setLebar(Math.max(0.1, parseFloat(e.target.value) || 1));
                          setSelectedPreset("custom");
                        }}
                        className="w-full pl-3 pr-8 py-2 bg-white rounded-xl border border-neutral-200/90 font-bold text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-xs pointer-events-none">
                        meter
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pilihan Finishing / Tipe Pengerjaan */}
            <div>
              <label className="font-bold text-neutral-900 block mb-2 text-xs">
                Pilihan Finishing & Spesifikasi:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {finishingOptions.map((fin) => {
                  const isSelected = selectedFinishing === fin.name;
                  return (
                    <button
                      key={fin.name}
                      type="button"
                      onClick={() => setSelectedFinishing(fin.name)}
                      className={`p-3 rounded-2xl text-left border transition-all active:scale-98 flex flex-col justify-between ${
                        isSelected
                          ? "border-neutral-950 bg-neutral-950 text-white shadow-xs"
                          : "border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-100/70 text-neutral-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <span className="font-bold text-xs leading-snug">
                          {fin.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                      <span className={`text-[10px] mt-1 line-clamp-1 ${
                        isSelected ? "text-neutral-300 font-normal" : "text-neutral-500"
                      }`}>
                        {fin.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jumlah Quantity */}
            <div className="flex items-center justify-between p-3.5 bg-neutral-50/80 rounded-2xl border border-neutral-200/80">
              <div>
                <span className="font-bold text-neutral-900 text-xs block">Jumlah Pesanan:</span>
                <span className="text-[10px] text-neutral-500">Sesuaikan kuantitas cetak</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-200/80 text-neutral-800 flex items-center justify-center font-bold active:scale-90 hover:bg-neutral-100 transition-all shadow-2xs"
                >
                  <Minus size={14} />
                </button>
                <span className="font-extrabold text-sm w-9 text-center text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-neutral-200/80 text-neutral-800 flex items-center justify-center font-bold active:scale-90 hover:bg-neutral-100 transition-all shadow-2xs"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Catatan Khusus */}
            <div>
              <label className="font-bold text-neutral-900 block mb-1.5 text-xs">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tambah logo di pojok kiri atas, warna dominan hijau, dll."
                className="w-full p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100 transition-all text-xs placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Bottom Actions (Sticky Safe-Area Padding) */}
          <div 
            className="p-4 border-t border-neutral-100 bg-white/95 backdrop-blur-md shrink-0 flex items-center justify-between gap-4"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 12px, 16px)" }}
          >
            <div>
              <span className="text-[10px] text-neutral-400 font-medium block leading-tight">
                Total Estimasi:
              </span>
              <span className="text-base sm:text-lg font-extrabold text-neutral-950 tracking-tight">
                {totalPrice > 0 ? `Rp ${totalPrice.toLocaleString("id-ID")}` : product.price}
              </span>
            </div>

            <button
              onClick={handleOrderWhatsApp}
              className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all"
            >
              <MessageCircle size={18} className="fill-white/20" />
              <span>Pesan via WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
