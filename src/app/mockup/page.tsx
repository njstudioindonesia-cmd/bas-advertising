"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Upload, 
  Download, 
  Palette, 
  Move, 
  Check, 
  ShoppingCart, 
  Sparkles, 
  Phone, 
  ArrowLeft, 
  Minus, 
  Plus, 
  X, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { useCart } from "@/context/CartContext";

export default function MockupGenerator() {
  const [productType, setProductType] = useState<"kaos" | "totebag">("kaos");
  const [view, setView] = useState<"depan" | "belakang">("depan");
  const [color, setColor] = useState("#FFFFFF");
  const [design, setDesign] = useState<string | null>(null);
  
  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSize, setOrderSize] = useState<"S" | "M" | "L" | "XL" | "XXL">("L");
  const [orderQty, setOrderQty] = useState(1);
  const [orderNote, setOrderNote] = useState("");
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { addToCart } = useCart();
  const canvasRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: "Putih", hex: "#FFFFFF" },
    { name: "Hitam", hex: "#333333" }, // Use slightly lighter black for multiply to work
    { name: "Navy", hex: "#1E293B" },
    { name: "Maroon", hex: "#7F1D1D" },
    { name: "Mustard", hex: "#D97706" },
    { name: "Hijau Army", hex: "#3F6212" },
  ];

  const getImageUrl = () => {
    if (productType === "totebag") {
      return "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop";
  };

  const imageUrl = getImageUrl();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDesign(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (canvasRef.current) {
      try {
        const canvas = await html2canvas(canvasRef.current, { 
          useCORS: true, 
          scale: 2,
          backgroundColor: "#F3F4F6" // Standard background for mockup
        });
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `mockup-${productType}-${view}.png`;
        link.href = url;
        link.click();
      } catch (err) {
        console.error("Failed to generate mockup image", err);
        alert("Gagal mengunduh mockup. Hal ini bisa terjadi jika URL gambar diblokir oleh CORS di browser Anda.");
      }
    }
  };

  const productPrice = productType === "kaos" ? 65000 : 25000;
  const selectedColorObj = colors.find((c) => c.hex === color) || colors[0];

  const handleOpenOrderModal = async () => {
    if (!canvasRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        scale: 1.5,
        backgroundColor: "#F3F4F6",
      });
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreviewThumbnail(dataUrl);
      setOrderModalOpen(true);
    } catch (e) {
      console.warn("Failed to capture snapshot:", e);
      setPreviewThumbnail(imageUrl);
      setOrderModalOpen(true);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleConfirmAddToCart = () => {
    const isKaos = productType === "kaos";
    const colorName = selectedColorObj.name;
    const basePrice = productPrice;
    const productId = isKaos ? "prod-kaos-sablon-dtf" : "prod-totebag-kanvas-custom";
    const title = isKaos
      ? `Kaos Sablon DTF (3D: ${colorName})`
      : `Tote Bag Kanvas Blacu (3D: ${colorName})`;

    const fullNote = [
      `[Studio 3D: Warna ${colorName}${isKaos ? `, Ukuran ${orderSize}` : ""}, Sisi ${view}]`,
      design ? "Desain kustom aktif di studio" : "Polos / Desain menyusul via WA",
      orderNote.trim() ? `Catatan: ${orderNote.trim()}` : "",
    ].filter(Boolean).join(" • ");

    const cartProduct = {
      id: productId,
      title: title,
      name: title,
      price: basePrice,
      img: previewThumbnail || imageUrl,
      imageUrl: previewThumbnail || imageUrl,
      category: "Merchandise & Sablon",
      unit: "/ pcs",
    };

    addToCart(cartProduct, orderQty, fullNote, true);
    setOrderModalOpen(false);
  };

  const handleDirectWhatsApp = () => {
    const isKaos = productType === "kaos";
    const colorName = selectedColorObj.name;
    const basePrice = productPrice;
    const total = basePrice * orderQty;

    const message = `Halo Cetak.inc Padang, saya ingin memesan dari *Studio Mockup 3D*:\n\n` +
      `*Produk:* ${isKaos ? "Kaos Custom Sablon DTF Premium" : "Tote Bag Kanvas Blacu Custom"}\n` +
      `*Warna:* ${colorName}\n` +
      (isKaos ? `*Ukuran:* ${orderSize}\n` : "") +
      `*Jumlah:* ${orderQty} pcs\n` +
      `*Estimasi Total:* Rp ${total.toLocaleString("id-ID")}\n` +
      (orderNote ? `*Catatan:* ${orderNote}\n\n` : "\n") +
      `Saya sudah menyiapkan desain visual di studio 3D Cetak.inc. Mohon diproses ya kak. Terima kasih!`;

    window.open(`https://wa.me/6282283995544?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-20 md:pt-36 pb-28 md:pb-24 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider block mb-1">
            Studio Visualisasi 3D
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-brand-dark mb-1 tracking-tight">
            Studio Mockup Interaktif
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">Visualisasikan desain Anda secara nyata sebelum dicetak.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Controls Panel */}
          <div className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 h-fit">
            
            {/* Product Type */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 p-1 rounded text-sm w-6 h-6 flex items-center justify-center">1</span>
                Pilih Produk
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProductType("kaos")}
                  className={`py-2 px-3 rounded-xl border-2 font-medium transition-all text-sm ${
                    productType === "kaos" ? "border-brand-accent bg-orange-50 text-brand-accent" : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  Kaos Polos
                </button>
                <button
                  onClick={() => { setProductType("totebag"); setView("depan"); }}
                  className={`py-2 px-3 rounded-xl border-2 font-medium transition-all text-sm ${
                    productType === "totebag" ? "border-brand-accent bg-orange-50 text-brand-accent" : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  Totebag
                </button>
              </div>
            </div>

            {/* View (Depan / Belakang) - Hanya untuk Kaos */}
            {productType === "kaos" && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-600 p-1 rounded text-sm w-6 h-6 flex items-center justify-center">2</span>
                  Sisi Produk
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setView("depan")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      view === "depan" ? "bg-white text-brand-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Depan
                  </button>
                  <button
                    onClick={() => setView("belakang")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                      view === "belakang" ? "bg-white text-brand-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Belakang
                  </button>
                </div>
              </div>
            )}

            {/* Color Picker */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 p-1 rounded text-sm w-6 h-6 flex items-center justify-center">{productType === "kaos" ? "3" : "2"}</span>
                Warna Produk
              </h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    className={`w-10 h-10 rounded-full shadow-sm border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      color === c.hex ? "border-brand-accent scale-110" : "border-gray-200"
                    }`}
                    style={{ backgroundColor: c.hex === "#FFFFFF" ? "#FFF" : c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && (
                      <Check size={16} color={c.hex === "#FFFFFF" ? "#000" : "#FFF"} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Design */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 p-1 rounded text-sm w-6 h-6 flex items-center justify-center">{productType === "kaos" ? "4" : "3"}</span>
                Upload Desain
              </h3>
              <div className="relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Upload className="text-gray-400 mb-2" size={28} />
                  <span className="font-medium text-gray-700 text-sm">Pilih File Desain</span>
                  <span className="text-xs text-gray-500 mt-1">Gunakan PNG Transparan</span>
                </div>
              </div>
              {design && (
                <button 
                  onClick={() => setDesign(null)}
                  className="mt-2 text-red-500 text-sm font-medium hover:underline flex justify-end w-full"
                >
                  Hapus Desain
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 mt-auto space-y-2.5">
              <button
                type="button"
                disabled={isCapturing}
                onClick={handleOpenOrderModal}
                className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-200 disabled:opacity-50 text-sm"
              >
                {isCapturing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Menyiapkan Desain 3D...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Pesan Desain Ini (Rp {productPrice.toLocaleString("id-ID")})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-gray-200 transition-colors text-xs"
              >
                <Download size={15} />
                Download Gambar Mockup
              </button>

              <p className="text-center text-[11px] text-gray-400">
                Posisikan logo/stiker dengan drag & drop pada baju sebelum menekan pesan.
              </p>
            </div>

          </div>

          {/* Canvas Preview Area */}
          <div className="lg:w-2/3 bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-sm min-h-[500px] p-4 lg:p-10">
            {/* The actual exportable canvas */}
            <div 
              ref={canvasRef}
              className="relative w-full max-w-[450px] aspect-[4/5] flex items-center justify-center bg-[#F3F4F6] rounded-xl overflow-hidden shadow-inner"
            >
              
              {/* 1. COLOR MASK LAYER: Hanya mengubah warna baju, background tetap abu-abu */}
              <div 
                className="absolute inset-4 transition-colors duration-300 pointer-events-none"
                style={{ 
                  backgroundColor: color,
                  WebkitMaskImage: `url(${imageUrl})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: `url(${imageUrl})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
              />

              {/* 2. TEXTURE LAYER: Menambahkan shadow dan lekukan dari gambar asli */}
              <div className="absolute inset-4 pointer-events-none opacity-90 mix-blend-multiply">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imageUrl} 
                  alt="Product Mockup Base" 
                  className="w-full h-full object-contain"
                  style={{ filter: "grayscale(100%)" }}
                  crossOrigin="anonymous" 
                />
              </div>

              {/* 3. DRAGGABLE DESIGN LAYER */}
              {design ? (
                <motion.div
                  drag
                  dragConstraints={canvasRef}
                  dragElastic={0}
                  dragMomentum={false}
                  className="absolute z-10 cursor-move"
                  style={{ top: '35%', left: '35%' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={design} 
                    alt="User Design" 
                    className="max-w-[120px] max-h-[120px] lg:max-w-[150px] lg:max-h-[150px] object-contain drop-shadow-sm hover:ring-2 hover:ring-brand-accent/50 p-1 bg-white/5"
                    draggable="false"
                  />
                </motion.div>
              ) : (
                <div className="absolute z-10 flex flex-col items-center justify-center text-gray-500 opacity-60 pointer-events-none bg-white/30 p-4 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
                  <Move size={32} className="mb-2" />
                  <p className="text-sm font-medium">Area Desain</p>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>

      {/* STICKY BOTTOM BAR KHUSUS MOBILE */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
            {productType === "kaos" ? "Kaos Polos DTF" : "Totebag Blacu"}
          </span>
          <span className="font-extrabold text-[#F97316] text-sm">
            Rp {productPrice.toLocaleString("id-ID")}
          </span>
        </div>
        <button
          type="button"
          disabled={isCapturing}
          onClick={handleOpenOrderModal}
          className="bg-[#F97316] hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-200 disabled:opacity-50"
        >
          {isCapturing ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
          Pesan Desain 3D Ini
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL ORDER DESAIN MOCKUP 3D                                */}
      {/* ========================================================= */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                    Konfirmasi Pesanan Desain 3D
                  </h3>
                  <span className="text-[10px] text-gray-400">
                    Visualisasi siap diproduksi oleh Cetak.inc Padang
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Card */}
            <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="w-20 h-24 rounded-xl bg-gray-200 overflow-hidden relative shrink-0 border border-gray-200">
                {previewThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewThumbnail}
                    alt="Pratinjau Desain 3D"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Preview
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  Studio 3D Validated
                </span>
                <h4 className="font-extrabold text-sm text-gray-900 truncate mt-1">
                  {productType === "kaos" ? "Kaos Custom Sablon DTF Premium" : "Tote Bag Kanvas Blacu Custom"}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>Warna: <strong>{selectedColorObj.name}</strong></span>
                  <span>•</span>
                  <span>Sisi: <strong>{view}</strong></span>
                </div>
                <div className="text-sm font-black text-[#F97316] mt-1">
                  Rp {productPrice.toLocaleString("id-ID")} <span className="text-[10px] text-gray-400 font-normal">/ pcs</span>
                </div>
              </div>
            </div>

            {/* Kaos Size Selector */}
            {productType === "kaos" && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Pilih Ukuran Kaos:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setOrderSize(sz)}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                        orderSize === sz
                          ? "bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Jumlah Pesanan:
              </label>
              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500">Jumlah Cetak (Pcs)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-extrabold text-sm text-gray-900 w-6 text-center">
                    {orderQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrderQty(orderQty + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Design Notes */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Catatan Produksi / Finishing (Opsional):
              </label>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Contoh: Sablon di dada kiri lebar 10cm, atau warna sablon tolong lebih cerah..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F97316] focus:outline-none"
              />
            </div>

            {/* Total Calculation */}
            <div className="bg-orange-50/60 border border-orange-200/80 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-500 block">Total Estimasi ({orderQty} pcs):</span>
                <span className="text-lg font-black text-[#F97316]">
                  Rp {(productPrice * orderQty).toLocaleString("id-ID")}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                Ready Cetak Padang
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="py-3 px-4 bg-[#0B1E36] hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-slate-900/10"
              >
                <ShoppingCart size={15} /> Masukkan Keranjang
              </button>
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-green-600/10"
              >
                <Phone size={15} /> Pesan Cepat via WA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
