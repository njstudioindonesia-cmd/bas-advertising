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
            className="fixed bottom-18 md:bottom-6 left-2.5 right-2.5 sm:left-auto sm:right-6 sm:w-[380px] z-40 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-neutral-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 p-1 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon-192.png"
                  alt="Cetak.inc App Icon"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs text-neutral-900 leading-none truncate">
                    Install Cetak.inc
                  </h4>
                  <span className="bg-neutral-100 text-neutral-600 text-[8px] font-semibold uppercase px-1 py-0.2 rounded">
                    PWA
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-0.5 truncate">
                  Akses kilat dari homescreen
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-medium text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1"
              >
                <Download size={12} strokeWidth={2} />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X size={12} />
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
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
                    <Smartphone size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900">Install di iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    Ketuk tombol <strong>Bagikan (Share)</strong> <Share size={13} className="inline text-blue-500 ml-1" /> di bilah Safari bawah.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> <PlusSquare size={13} className="inline text-neutral-700 ml-1" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                  <span className="w-6 h-6 rounded-full bg-neutral-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    Ketuk <strong>Tambah</strong> di pojok kanan atas. Ikon Cetak.inc akan muncul di beranda HP Anda!
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-3 bg-neutral-900 text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition-colors"
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
