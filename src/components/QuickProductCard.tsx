"use client";

import Image from "next/image";
import { Star, Zap, MessageCircle } from "lucide-react";

interface QuickProductCardProps {
  product: any;
  onOpenDetail?: (product: any) => void;
}

export default function QuickProductCard({ product, onOpenDetail }: QuickProductCardProps) {
  const handleCardClick = () => {
    if (onOpenDetail) {
      onOpenDetail(product);
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetail) {
      onOpenDetail(product);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 hover:border-orange-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98] w-full min-w-0 overflow-hidden"
    >
      {/* GAMBAR PRODUK */}
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

        {/* HARGA & TOMBOL PESAN */}
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

          <button
            type="button"
            onClick={handleOrderClick}
            aria-label={`Pesan ${product.name || product.title}`}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] sm:text-[11px] flex items-center gap-1 transition-all active:scale-95"
          >
            <MessageCircle size={12} className="text-emerald-600" />
            <span>Pesan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
