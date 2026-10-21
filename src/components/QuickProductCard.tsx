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
      className="group relative bg-white rounded-3xl p-3 border border-gray-100 hover:border-orange-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
    >
      {/* GAMBAR PRODUK DENGAN BADGE ALA ASTRO */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 mb-2.5">
        <Image
          src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800"}
          alt={product.name || product.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* TOP BADGES */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Star size={9} className="fill-white" /> Best
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-xs text-[#F97316] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-2xs border border-orange-100 flex items-center gap-0.5">
            <Zap size={9} className="fill-[#F97316]" /> Kilat
          </span>
        </div>

        {/* RATING PILL */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span>{product.rating || "5.0"}</span>
        </div>
      </div>

      {/* INFORMASI PRODUK */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
            {product.category || "Cetak.inc"}
          </span>
          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-[#F97316] transition-colors">
            {product.name || product.title}
          </h4>
        </div>

        {/* HARGA & STEPPER ALA ASTRO */}
        <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between gap-1.5">
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm text-[#F97316] tracking-tight">
              {product.price}
            </span>
            {product.normalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {product.normalPrice}
              </span>
            )}
          </div>

          {/* TOMBOL / STEPPER */}
          {qty === 0 ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="bg-orange-50 hover:bg-[#F97316] text-[#F97316] hover:text-white border border-orange-200/80 hover:border-transparent font-black text-xs px-3 py-1.5 rounded-xl shadow-2xs active:scale-90 transition-all flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Tambah</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-[#F97316] text-white rounded-xl p-0.5 shadow-sm shadow-orange-500/20"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 active:scale-75 transition-all"
              >
                <Minus size={12} strokeWidth={3} />
              </button>
              <span className="w-5 text-center font-black text-xs">
                {qty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 active:scale-75 transition-all"
              >
                <Plus size={12} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
