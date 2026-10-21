"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LogOut,
  Power,
  RefreshCw,
  Camera,
  ExternalLink,
} from "lucide-react";

interface DriverUser {
  id: string;
  username: string;
  role: string;
  fullName: string;
  hubId: string | null;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<DriverUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push("/driver/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/driver/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // Screen Wake Lock API agar layar smartphone driver tidak mati saat perjalanan
  useEffect(() => {
    let wakeLock: any = null;
    async function requestWakeLock() {
      if (typeof window !== "undefined" && "wakeLock" in navigator && isOnline) {
        try {
          wakeLock = await (navigator as any).wakeLock.request("screen");
          setWakeLockActive(true);
        } catch {
          setWakeLockActive(false);
        }
      }
    }
    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isOnline]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/driver/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
          <span className="text-sm font-medium">Memuat Portal Driver...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071322] text-white flex flex-col max-w-lg mx-auto border-x border-white/5 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B1E36]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">{user?.fullName || "Budi Santoso"}</h1>
            <p className="text-[11px] text-white/60">Kurir Internal Padang • BA 4821 QA</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-white/5 text-white/70 hover:text-white border border-white/10 text-xs"
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Online / Offline Shift Status Toggle */}
      <div className="p-4">
        <div
          className={`rounded-2xl p-4 border transition flex items-center justify-between shadow-lg ${
            isOnline
              ? "bg-gradient-to-r from-emerald-950/40 to-[#0B1E36] border-emerald-500/30 text-white"
              : "bg-[#0B1E36] border-white/10 text-white/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-emerald-400 animate-pulse" : "bg-white/30"
              }`}
            />
            <div>
              <p className="text-xs font-bold">{isOnline ? "STATUS: AKTIF & SIAP ANTAR" : "STATUS: ISTIRAHAT / OFFLINE"}</p>
              <p className="text-[11px] text-white/50">
                {isOnline
                  ? wakeLockActive
                    ? "Layar menyala otomatis (Wake Lock ON)"
                    : "Siap menerima order kurir"
                  : "Nyalakan tombol untuk menerima pesanan"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition ${
              isOnline
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white/10 text-white/40"
            }`}
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Task (Jika Ada) */}
      <main className="px-4 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">
            Tugas Pengantaran Aktif (1)
          </h2>
          <span className="text-[11px] text-sky-400 font-mono">15 Menit ETA</span>
        </div>

        {/* Task Card */}
        <div className="bg-[#0B1E36] border border-sky-500/30 rounded-2xl p-4 flex flex-col gap-3.5 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                  #BAS-20261022-7719
                </span>
                <span className="text-[11px] text-white/50">Instan</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Kaos Sablon DTF Combed 30s (3 Pcs)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              JEMPUT
            </span>
          </div>

          {/* Rute Jemput -> Antar */}
          <div className="bg-[#071322] border border-white/5 rounded-xl p-3 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
              <div>
                <p className="text-[10px] text-white/40">AMBIL DI WORKSHOP</p>
                <p className="font-medium text-white">Hub Pusat BAS Advertising Padang</p>
                <p className="text-[11px] text-white/50">Jl. Belanti Baru No. 17, Lolong</p>
              </div>
            </div>

            <div className="w-px h-3 bg-white/20 ml-1.5" />

            <div className="flex items-start gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 shrink-0" />
              <div>
                <p className="text-[10px] text-white/40">ANTAR KE PELANGGAN</p>
                <p className="font-medium text-white">Siti Nurhaliza (081267890123)</p>
                <p className="text-[11px] text-white/50">
                  Jl. Khatib Sulaiman No. 42 (Depan Masjid Raya Sumbar)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: Navigasi & Hubungi */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=-0.9242,100.3626"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Navigation className="w-4 h-4" /> Buka Google Maps
            </a>
            <a
              href="https://wa.me/6281267890123?text=Halo%20Kak,%20saya%20Budi%20kurir%20Cetak.inc%20sedang%20mengantar%20pesanan%20Anda."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Pelanggan
            </a>
          </div>

          {/* Status Progression Button */}
          <button className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition">
            <CheckCircle2 className="w-4 h-4" /> Sudah Dijemput di Workshop
          </button>
        </div>
      </main>
    </div>
  );
}
