import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/db/queries/products";
import { Star, ArrowLeft, CheckCircle2, Share2, ShieldCheck, Truck, Clock } from "lucide-react";
import ProductDetailActions from "@/components/ProductDetailActions";

export const dynamic = "force-dynamic";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = getProductById(resolvedParams.id);

  if (!product || !product.isActive) {
    notFound();
  }

  // Related products from same category
  const relatedResult = getProducts({ category: product.category, limit: 6 });
  const related = relatedResult.products
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-20 md:pt-36 pb-36 md:pb-24">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* 📱 MOBILE APP TOP BAR / BREADCRUMB */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/produk" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-gray-200/80 shadow-2xs hover:text-[#F97316] active:scale-95 transition-all"
          >
            <ArrowLeft size={14} /> Kembali
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
            {product.category}
          </span>
        </div>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          
          {/* Left: Product Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <Image 
                src={product.imageUrl || product.img || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"} 
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.isBestSeller && (
                <div className="absolute top-3 left-3 bg-[#FF3E6C] text-white text-[9px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  🔥 Best Seller
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 hover:border-[#F97316] transition-colors border-white bg-white shadow-2xs">
                    <Image 
                      src={img} 
                      alt={`${product.title} view ${idx}`} 
                      fill 
                      sizes="25vw"
                      className="object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100/90 shadow-2xs flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              {product.category}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#0B1E36] mb-3 leading-tight">
              {product.title}
            </h1>

            {/* Rating & Sold */}
            <div className="flex items-center gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                <Star size={13} fill="currentColor" /> {product.rating || "5.0"}
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-medium">Terjual {product.sold || "100+"}</span>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Stok Tersedia
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-gray-50/80 p-4 rounded-2xl mb-6 border border-gray-100 flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F97316]">
                {product.price}
              </span>
              {product.normalPrice && (
                <span className="text-sm sm:text-base text-gray-400 line-through">
                  {product.normalPrice}
                </span>
              )}
              <span className="text-xs text-gray-500 font-medium ml-auto">
                {product.unit}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Deskripsi Produk
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.desc || "Produk cetak berkualitas tinggi untuk kebutuhan bisnis Anda."}
              </p>
            </div>

            {/* Specifications */}
            {product.specs && product.specs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  Spesifikasi & Keunggulan
                </h3>
                <div className="space-y-1.5">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 text-center mb-6">
              <div className="p-2 rounded-xl bg-gray-50/60">
                <ShieldCheck size={18} className="mx-auto text-blue-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Garansi Presisi</span>
              </div>
              <div className="p-2 rounded-xl bg-gray-50/60">
                <Truck size={18} className="mx-auto text-orange-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Kirim Cepat</span>
              </div>
              <div className="p-2 rounded-xl bg-gray-50/60">
                <Clock size={18} className="mx-auto text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-700 block">Konsultasi WA</span>
              </div>
            </div>

            {/* Action Buttons (Desktop & Fallback) */}
            <div className="mt-auto pt-2">
              <ProductDetailActions product={product} />
            </div>

          </div>

        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-8 border-t border-gray-200/80 pt-8">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0B1E36] mb-4">
              Produk Terkait di Kategori {product.category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map((rel) => (
                <Link 
                  key={rel.id} 
                  href={`/produk/${rel.id}`}
                  className="bg-white rounded-2xl p-2.5 sm:p-3 border border-gray-100 shadow-2xs hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
                    <Image 
                      src={rel.imageUrl || rel.img} 
                      alt={rel.title} 
                      fill 
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-[#F97316]">
                    {rel.title}
                  </h3>
                  <div className="text-xs sm:text-sm font-extrabold text-[#F97316] mt-1">
                    {rel.price}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
