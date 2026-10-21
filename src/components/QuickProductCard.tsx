"use client";

import Image from "next/image";
import { Plus, Minus, Check, Star, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface QuickProductCardProps {
  product: any;
  onOpenDetail?: (product: any) => void;
}

export default function QuickProductCard({ product, onOpenDetail }: QuickProductCardProps) {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const qty = getItemQuantity(product.id);

  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, "", false);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.id, qty - 1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 hover:border-orange-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
    >
      {/* GAMBAR PRODUK DENGAN BADGE ALA ASTRO */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100/60 mb-2">
        <Image
          src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
          alt={product.name || product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* TOP BADGES */}
        <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
              <Star size={8} className="fill-white" /> Best
            </span>
          )}
          <span className="bg-white/95 backdrop-blur-xs text-[#F97316] text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-md shadow-2xs border border-orange-100 flex items-center gap-0.5">
            <Zap size={8} className="fill-[#F97316]" /> Kilat
          </span>
        </div>

        {/* RATING PILL */}
        <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Star size={9} className="text-amber-400 fill-amber-400" />
          <span>{product.rating || "5.0"}</span>
        </div>
      </div>

      {/* INFORMASI PRODUK */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5 truncate">
            {product.category || "Cetak.inc"}
          </span>
          <h4 className="font-extrabold text-[11px] sm:text-xs md:text-sm text-gray-900 leading-snug line-clamp-2 h-7 sm:h-8 group-hover:text-[#F97316] transition-colors">
            {product.name || product.title}
          </h4>
        </div>

        {/* HARGA & STEPPER ALA ASTRO */}
        <div className="mt-2 pt-1.5 border-t border-gray-50 flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <span className="font-black text-xs sm:text-sm text-[#F97316] tracking-tight truncate block">
              {product.price}
            </span>
            {product.normalPrice && (
              <span className="text-[9px] text-gray-400 line-through leading-none block truncate">
                {product.normalPrice}
              </span>
            )}
          </div>

          {/* TOMBOL / STEPPER */}
          {qty === 0 ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Tambah ${product.name || product.title} ke keranjang`}
              className="w-7 h-7 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-orange-50 hover:bg-[#F97316] text-[#F97316] hover:text-white border border-orange-200/80 hover:border-transparent font-bold text-xs shadow-2xs active:scale-90 transition-all flex items-center justify-center shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline ml-1 font-black">Tambah</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-[#F97316] text-white rounded-lg p-0.5 shrink-0 shadow-xs"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center hover:bg-black/10 active:scale-75 transition-all"
              >
                <Minus size={11} strokeWidth={3} />
              </button>
              <span className="w-4 sm:w-5 text-center font-black text-[11px] sm:text-xs">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center hover:bg-black/10 active:scale-75 transition-all"
              >
                <Plus size={11} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
