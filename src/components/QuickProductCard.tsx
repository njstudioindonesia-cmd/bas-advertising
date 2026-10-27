"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";

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

  const imageUrl = product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800";
  const title = product.name || product.title || "Produk Cetak";
  const category = product.category || "Percetakan";

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl p-3 sm:p-3.5 border border-neutral-200/70 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.99] w-full min-w-0"
    >
      {/* 🖼️ FOTO PRODUK CLEAN & MINIMALIS */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 mb-3">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={Boolean(imageUrl.startsWith("data:"))}
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Minimalist Badge: Best Seller Only */}
        {product.isBestSeller && (
          <span className="absolute top-2.5 right-2.5 bg-neutral-900/85 backdrop-blur-md text-white text-[9px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
            Best Seller
          </span>
        )}
      </div>

      {/* 📄 DETAIL & TYPOGRAPHY CLEAN */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <span className="text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-neutral-400 block mb-1 truncate">
            {category}
          </span>
          <h3 className="font-semibold text-xs sm:text-[14px] text-neutral-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>
        </div>

        {/* 🏷️ HARGA & ACTION BUTTON */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-neutral-900 tracking-tight">
                {product.price}
              </span>
              {product.normalPrice && (
                <span className="text-[11px] text-neutral-400 line-through font-normal">
                  {product.normalPrice}
                </span>
              )}
            </div>
            {product.unit && (
              <span className="text-[10px] text-neutral-400 block -mt-0.5 truncate">
                {product.unit}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOrderClick}
            aria-label={`Pesan ${title} via WhatsApp`}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 transition-all shrink-0"
          >
            <MessageCircle size={13} className="fill-white/20" />
            <span>Pesan</span>
          </button>
        </div>
      </div>
    </article>
  );
}
