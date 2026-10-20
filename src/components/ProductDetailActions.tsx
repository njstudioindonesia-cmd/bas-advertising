"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, MessageCircle, Plus, Minus, Check, ShieldCheck, Truck, Star } from "lucide-react";
import { useCart, parsePriceToNumber } from "@/context/CartContext";

export default function ProductDetailActions({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");
  const { addToCart, formatRupiah } = useCart();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data["contact.whatsapp"]) {
          setWhatsappNumber(String(data.data["contact.whatsapp"]).replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  const unitPrice = parsePriceToNumber(product.price);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, notes);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    let cleanWa = whatsappNumber;
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    let msg = `*HALO PUSAT CETAK PADANG, SAYA INGIN BELI PRODUK INI:*\n`;
    msg += `----------------------------------------\n`;
    msg += `📦 *Produk:* ${product.title || product.name}\n`;
    msg += `🏷️ *Kategori:* ${product.category}\n`;
    msg += `🔢 *Jumlah:* ${quantity} ${product.unit || "/ pcs"}\n`;
    msg += `💰 *Harga Satuan:* ${product.price}\n`;
    if (totalPrice > 0) {
      msg += `💵 *Total Estimasi:* *${formatRupiah(totalPrice)}*\n`;
    }
    if (notes) {
      msg += `📝 *Catatan Tambahan:* ${notes}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `Mohon konfirmasi ketersediaan dan cara pembayarannya. Terima kasih!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <>
      {/* ========================================================= */}
      {/* INLINE PRODUCT CONFIGURATOR (FOR DESKTOP & IN-PAGE FORM) */}
      {/* ========================================================= */}
      <div className="mt-auto space-y-4">
        {/* Quantity & Notes input */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-gray-700">Jumlah Pesanan:</span>
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-90"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 text-center text-sm font-bold text-[#1E1B4B] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-90"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {totalPrice > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200/60">
              <span>Subtotal ({quantity} {product.unit || "/ pcs"}):</span>
              <span className="text-sm font-bold text-[#F97316]">{formatRupiah(totalPrice)}</span>
            </div>
          )}

          <input
            type="text"
            placeholder="Catatan desain / ukuran khusus (opsional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F97316]"
          />
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            className={`py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm ${
              added 
                ? "bg-green-600 text-white" 
                : "bg-white border-2 border-[#1E1B4B] text-[#1E1B4B] hover:bg-slate-50"
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
            {added ? "Sudah di Keranjang!" : "+ Keranjang"}
          </button>

          <button
            onClick={handleBuyNow}
            className="bg-[#1E1B4B] hover:bg-[#F97316] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
          >
            <MessageCircle size={18} />
            Beli via WhatsApp
          </button>
        </div>

        {/* Trust Badging */}
        <div className="flex items-center justify-between px-1 text-[11px] text-gray-400 font-medium pt-1">
          <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-[#10B981]" /> Transaksi Aman</div>
          <div className="flex items-center gap-1"><Truck size={14} className="text-[#3B82F6]" /> Support Pengiriman</div>
          <div className="flex items-center gap-1"><Star size={14} className="text-[#F59E0B]" /> Garansi Kualitas</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📱 MOBILE STICKY BOTTOM APP BAR (ALWAYS THUMB-REACHABLE) */}
      {/* ========================================================= */}
      <div 
        className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/80 p-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center gap-2"
      >
        <button
          onClick={handleAddToCart}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
            added 
              ? "bg-green-600 text-white" 
              : "bg-orange-50 border border-orange-200 text-[#F97316]"
          }`}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          <span>{added ? "Masuk Keranjang" : "+ Keranjang"}</span>
        </button>

        <button
          onClick={handleBuyNow}
          className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-[#1E1B4B] hover:bg-[#F97316] text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <MessageCircle size={16} />
          <span>Beli via WA</span>
        </button>
      </div>
    </>
  );
}
