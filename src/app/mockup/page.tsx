"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Download, Palette, Move, Check } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

export default function MockupGenerator() {
  const [productType, setProductType] = useState<"kaos" | "totebag">("kaos");
  const [view, setView] = useState<"depan" | "belakang">("depan");
  const [color, setColor] = useState("#FFFFFF");
  const [design, setDesign] = useState<string | null>(null);
  
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
      return "/images/totebag.png";
    }
    if (view === "depan") {
      return "/images/tshirt_depan.png";
    }
    return "/images/tshirt_belakang.png";
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

            {/* Action */}
            <div className="pt-4 border-t border-gray-100 mt-auto">
              <button
                onClick={handleDownload}
                className="w-full bg-brand-dark hover:bg-brand-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Download size={18} />
                Download Mockup
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Geser (drag) desain pada area mockup untuk menyesuaikan posisi.
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
    </div>
  );
}
