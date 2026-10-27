"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, Minus, ShieldCheck, Truck, Clock } from "lucide-react";

export default function ProductDetailActions({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("6281234567890");

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

  const handleBuyNow = () => {
    let cleanWa = whatsappNumber;
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    let msg = `*HALO CETAK.INC, SAYA INGIN BELI PRODUK INI:*\n`;
    msg += `----------------------------------------\n`;
    msg += `📦 *Produk:* ${product.title || product.name}\n`;
    msg += `🏷️ *Kategori:* ${product.category}\n`;
    msg += `🔢 *Jumlah:* ${quantity} ${product.unit || "pcs"}\n`;
    msg += `💰 *Harga Satuan:* ${product.price}\n`;
    if (notes) {
      msg += `📝 *Catatan Tambahan:* ${notes}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `Mohon konfirmasi ketersediaan dan cara kirim filenya. Terima kasih!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
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
            <span className="w-8 text-center font-bold text-sm text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-90"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-600 block mb-1">Catatan Pesanan:</label>
          <input
            type="text"
            placeholder="Misal: Ukuran custom, warna, finishing mata ayam..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#F97316] transition-all"
          />
        </div>
      </div>

      {/* WhatsApp CTA Button */}
      <button
        onClick={handleBuyNow}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
      >
        <MessageCircle size={18} />
        <span>Pesan via WhatsApp Sekarang</span>
      </button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-gray-500 font-semibold">
        <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
          <Clock size={16} className="text-[#F97316]" />
          <span>Cepat & Tepat</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Garansi Kualitas</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-gray-100">
          <Truck size={16} className="text-blue-500" />
          <span>Kirim se-Padang</span>
        </div>
      </div>
    </div>
  );
}
