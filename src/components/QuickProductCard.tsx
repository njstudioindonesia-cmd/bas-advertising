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

  const imageUrl = product.imageUrl || product.img || "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?q=80&w=800";
  const title = product.name || product.title || "Produk Cetak";

  return (
    <article
      onClick={handleCardClick}
      className="group relative bg-white rounded-3xl p-2.5 sm:p-3 border border-neutral-200/80 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-300 flex flex-col justify-between cursor-pointer active:scale-[0.98] w-full min-w-0"
    >
      {/* 🖼️ FOTO PRODUK VISUAL TINGGI & MODERN [4/5] */}
      <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-neutral-100 mb-2">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={Boolean(imageUrl.startsWith("data:"))}
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Floating Minimalist Badge */}
        {product.isBestSeller ? (
          <span className="absolute top-2 left-2 bg-neutral-900/90 backdrop-blur-md text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-2xs">
            Best Seller
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-neutral-800 text-[9px] font-medium tracking-wide px-2 py-0.5 rounded-full shadow-2xs border border-neutral-200/50">
            ⚡ Siap 24 Jam
          </span>
        )}

        {/* Floating WhatsApp Action Pill */}
        <button
          type="button"
          onClick={handleOrderClick}
          aria-label={`Pesan ${title} via WhatsApp`}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 transition-all z-10"
        >
          <MessageCircle size={15} />
        </button>
      </div>

      {/* 📄 DETAIL & TYPOGRAPHY CLEAN */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-xs sm:text-[13px] text-neutral-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {title}
          </h3>
        </div>

        {/* 🏷️ HARGA & UNIT */}
        <div className="mt-1 flex items-baseline justify-between gap-1 pt-1 border-t border-neutral-100">
          <span className="font-extrabold text-xs sm:text-sm text-neutral-950 tracking-tight">
            {product.price}
          </span>
          {product.unit && (
            <span className="text-[10px] text-neutral-400 font-normal truncate">
              {product.unit}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
