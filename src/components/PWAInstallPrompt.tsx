"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Sparkles, Smartphone, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Cek apakah sudah berjalan di mode standalone (sudah diinstall)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Daftarkan Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // SW registered successfully
        })
        .catch((err) => {
          // SW registration failed
        });
    }

    // 3. Deteksi platform iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Cek apakah prompt baru saja ditutup (cooldown 5 hari)
    const dismissedTime = localStorage.getItem("cetakinc_pwa_dismissed");
    if (dismissedTime) {
      const daysPassed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < 5) return;
    }

    // 5. Listener untuk event instalasi Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tampilkan banner dengan delay halus agar tidak mengganggu first load
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Jika di iOS Safari, tampilkan banner setelah delay
    if (isIosDevice && !isStandalone) {
      const isSafari = /safari/.test(userAgent) && !/crios|fxios/.test(userAgent);
      if (isSafari) {
        setTimeout(() => setShowPrompt(true), 4000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("cetakinc_pwa_dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <>
      {/* 📱 FLOATING PWA INSTALL BANNER (ALA ASTRO / GOJEK) */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-40 bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-orange-100 shadow-[0_12px_40px_-10px_rgba(249,115,22,0.25)] flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E1B4B] to-[#0B1E36] p-1.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden border border-white/20">
                  <Image
                    src="/icon-192.png"
                    alt="Cetak.inc App Icon"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-[#1E1B4B] leading-tight">
                      Install Cetak.inc App
                    </h3>
                    <span className="bg-orange-100 text-[#F97316] text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full">
                      PWA
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                    Pesan cetakan kilat langsung dari layar utama HP
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-4 bg-[#F97316] hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                <span>Tambahkan ke Layar Utama</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="py-2.5 px-3 text-gray-500 hover:text-gray-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Nanti
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🍏 MODAL PETUNJUK KHUSUS IPHONE / IPAD (SAFARI) */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-[2rem] p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <h3 className="font-extrabold text-sm text-[#1E1B4B]">Install di iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#F97316] font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    Ketuk tombol <strong>Bagikan (Share)</strong> <Share size={13} className="inline text-blue-500 ml-1" /> di bilah navigasi bawah Safari Anda.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#F97316] font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    Gulir ke bawah dan ketuk opsi <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare size={13} className="inline text-gray-700 ml-1" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-[#F97316] font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon Cetak.inc akan langsung muncul di beranda HP Anda!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 bg-[#1E1B4B] text-white font-bold text-xs rounded-xl hover:bg-black transition-colors"
              >
                Saya Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
