"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const INITIAL_MOCKUPS = [
  { id: "1", category: "Packaging", client: "San Dobi Coffee Packaging Collection", imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1200&auto=format&fit=crop" },
  { id: "2", category: "Signage", client: "San Dobi Outlet Signage & Wayfinding", imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop" },
  { id: "3", category: "Print", client: "San Dobi Corporate Stationery Collection", imageUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=1200&auto=format&fit=crop" },
  { id: "4", category: "Banners", client: "Culinary Festival Sumbar 2024", imageUrl: "https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800&auto=format&fit=crop" },
  { id: "5", category: "Packaging", client: "San Dobi Dragon Cup Series", imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop" },
  { id: "6", category: "Signage", client: "San Dobi Neon Box & Interior", imageUrl: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=1200&auto=format&fit=crop" },
];

export default function Mockup() {
  const [items, setItems] = useState<any[]>(INITIAL_MOCKUPS);
  const [activeTab, setActiveTab] = useState("All Work");

  useEffect(() => {
    fetch("/api/portfolio")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setItems(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["All Work", ...Array.from(new Set(items.map(m => m.category || "General")))];

  const filteredMockups = activeTab === "All Work" 
    ? items 
    : items.filter(m => (m.category || "General") === activeTab);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-28 md:pb-32">
      {/* HEADER */}
      <section className="pt-20 md:pt-36 pb-6 md:pb-12 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[10px] font-bold text-[#F97316] uppercase tracking-wider block mb-1">
            Galeri Portofolio Proyek
          </span>
          <h1 className="font-display text-2xl sm:text-5xl md:text-6xl text-brand-dark mb-2 sm:mb-4 tracking-tight">
            Selected Works
          </h1>
          <p className="text-xs sm:text-base font-light text-gray-500 max-w-2xl mx-auto">
            Koleksi hasil cetak nyata, instalasi signage, dan merchandise San Dobi serta brand terkemuka.
          </p>
        </motion.div>
      </section>

      {/* GALLERY */}
      <section className="px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-3.5 px-3.5 sm:mx-0 sm:justify-center mb-6 sm:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 active:scale-95 ${
                activeTab === cat 
                  ? "bg-brand-dark text-white shadow-xs" 
                  : "bg-white text-gray-500 hover:text-brand-dark border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMockups.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                key={item.id}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 cursor-pointer"
              >
                <Image 
                  src={item.imageUrl || item.img || "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop"} 
                  alt={item.title || item.client || "Portofolio"} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                
                {/* Elegant Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                  >
                    <span className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-2 block">
                      {item.category}
                    </span>
                    <h3 className="text-2xl font-semibold text-white tracking-tight">{item.title || item.client}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="mt-20 md:mt-32 text-center">
          <h2 className="text-2xl sm:text-3xl font-display text-brand-dark mb-4 sm:mb-8 tracking-tight">Have a similar project in mind?</h2>
          <Link 
            href="/hubungi" 
            className="btn-primary inline-flex items-center gap-2"
          >
            Let's Collaborate <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
