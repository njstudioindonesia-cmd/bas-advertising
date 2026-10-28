"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Clock,
  Star,
  ArrowUpRight
} from "lucide-react";

interface ProductBottomSheetProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductBottomSheet({ product, isOpen, onClose }: ProductBottomSheetProps) {
  const [waNumber, setWaNumber] = useState("6282172725267");

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

  const title = product?.name || product?.title || "Produk Cetak";
  const imageUrl = product?.imageUrl || product?.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
  const description = product?.description || product?.desc || "";
  const specs = Array.isArray(product?.specs) ? product.specs : [];

  let cleanWa = waNumber;
  if (cleanWa.startsWith("0")) {
    cleanWa = "62" + cleanWa.slice(1);
  } else if (!cleanWa.startsWith("62")) {
    cleanWa = "62" + cleanWa;
  }

  const handleOrderWhatsApp = () => {
    if (!product) return;
    let msg = `*HALO CETAK.INC, SAYA INGIN KONSULTASI & PESAN:*\n`;
    msg += `----------------------------------------\n`;
    msg += `📦 *Produk:* ${title}\n`;
    msg += `🏷️ *Kategori:* ${product.category || "Umum"}\n`;
    if (product.price) {
      msg += `💰 *Harga:* ${product.price} ${product.unit || ""}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `Mohon info ketersediaan dan panduan cara kirim file desainnya. Terima kasih!`;

    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, "_blank");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop dengan blur lembut */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Sheet Modern - Pure Product Detail */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 border-t border-neutral-200/50"
          >
            {/* Top Indicator Handle (Native Mobile App Style) */}
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

            {/* Header Bar */}
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                  {product.category || "Cetak.inc"}
                </span>
                {product.isBestSeller && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                    🔥 Best Seller
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-500 hover:text-neutral-900 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content: Detail Produk */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs no-scrollbar">
              {/* Foto Produk */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/70 shadow-xs">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover"
                />
              </div>

              {/* Nama Produk & Harga */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-snug tracking-tight">
                  {title}
                </h3>

                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
                    {product.price}
                  </span>
                  {product.unit && (
                    <span className="text-xs text-neutral-500 font-medium">
                      {product.unit}
                    </span>
                  )}
                  {product.normalPrice && (
                    <span className="text-xs text-neutral-400 line-through font-normal ml-1">
                      {product.normalPrice}
                    </span>
                  )}
                </div>

                {/* Rating & Sold Indicator */}
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1 font-semibold text-neutral-800">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{product.rating || "5.0"}</span>
                  </div>
                  <span>•</span>
                  <span>{product.sold ? `${product.sold} Terjual` : "Kualitas Terjamin"}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Siap Kirim
                  </span>
                </div>
              </div>

              {/* Deskripsi Produk */}
              {description && (
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-neutral-900 mb-1.5">Deskripsi Produk:</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              )}

              {/* Spesifikasi Detail Produk */}
              {specs.length > 0 && (
                <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-200/70 space-y-2.5">
                  <h4 className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Spesifikasi & Detail Bahan:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {specs.map((spec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jaminan Layanan Cetak.inc */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 flex items-center gap-2">
                  <Clock size={16} className="text-neutral-700 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-neutral-900 block leading-tight">Proses Cepat</span>
                    <span className="text-[9px] text-neutral-500">Tepat waktu & rapi</span>
                  </div>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/60 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-neutral-700 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-neutral-900 block leading-tight">Garansi Kualitas</span>
                    <span className="text-[9px] text-neutral-500">Warna tajam presisi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action: Langsung Konsultasi & Pesan ke WhatsApp */}
            <div 
              className="p-4 border-t border-neutral-100 bg-white/95 backdrop-blur-md shrink-0 flex flex-col gap-2"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 12px, 16px)" }}
            >
              <button
                onClick={handleOrderWhatsApp}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 transition-all"
              >
                <MessageCircle size={18} className="fill-white/20" />
                <span>Tanya & Pesan via WhatsApp</span>
              </button>
              <p className="text-[10px] text-center text-neutral-400 font-normal">
                ⚡ Terhubung langsung dengan CS Cetak.inc untuk kirim file & konsultasi
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
