"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  LogOut,
  MapPin,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

interface VendorUser {
  id: string;
  username: string;
  role: string;
  fullName: string;
  hubId: string | null;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "production" | "ready">("incoming");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok || !data.authenticated) {
          router.push("/vendor/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/vendor/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/vendor/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
          <span className="text-sm font-medium">Memuat Antrean Cetak Workshop...</span>
        </div>
      </div>
    );
  }

  const isLubukBuaya = user?.username.toLowerCase().includes("lubuk");
  const hubName = isLubukBuaya
    ? "Hub Lubuk Buaya (Koto Tangah)"
    : "Hub Pusat BAS Advertising Padang";

  return (
    <div className="min-h-screen bg-[#071322] text-white flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B1E36]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight">
                  {user?.fullName || "Vendor Cetak.inc"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-white/60 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" /> {hubName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Hub Capacity & Stats Header */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-3.5 text-center sm:text-left">
            <p className="text-[11px] text-white/50 font-medium">Antrean Baru</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">2</p>
            <p className="text-[10px] text-white/40 mt-0.5 hidden sm:block">Perlu Diterima</p>
          </div>
          <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-3.5 text-center sm:text-left">
            <p className="text-[11px] text-white/50 font-medium">Sedang Cetak</p>
            <p className="text-xl sm:text-2xl font-black text-sky-400 mt-1">3</p>
            <p className="text-[10px] text-white/40 mt-0.5 hidden sm:block">Mesin Aktif</p>
          </div>
          <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-3.5 text-center sm:text-left">
            <p className="text-[11px] text-white/50 font-medium">Siap Antar</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">1</p>
            <p className="text-[10px] text-white/40 mt-0.5 hidden sm:block">Menunggu Kurir</p>
          </div>
        </div>

        {/* Tab Filters (Kitchen Style) */}
        <div className="flex bg-[#0B1E36] p-1.5 rounded-2xl border border-white/10 gap-1.5">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "incoming"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" /> Masuk (2)
          </button>
          <button
            onClick={() => setActiveTab("production")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "production"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Printer className="w-4 h-4" /> Diproduksi (3)
          </button>
          <button
            onClick={() => setActiveTab("ready")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "ready"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Siap Antar (1)
          </button>
        </div>

        {/* Queue Cards List */}
        <div className="space-y-3.5">
          {activeTab === "incoming" && (
            <>
              {/* Order Card 1 */}
              <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg hover:border-amber-500/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        #BAS-20261022-4912
                      </span>
                      <span className="text-xs text-white/50">10 menit lalu</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold mt-1 text-white">
                      Spanduk Flexi China 280g (3 × 1 meter)
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Pemesan: <strong className="text-white">Rahmat Hidayat</strong> • Mata Ayam 4 Sudut
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                    DIBAYAR
                  </span>
                </div>

                <div className="bg-[#071322] border border-white/5 rounded-xl p-3 text-xs text-white/70 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-white/40">Tujuan Pengiriman</p>
                    <p className="font-medium text-white truncate max-w-xs">
                      Jl. Adinegoro, Lubuk Buaya (1.8 km dari Hub)
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    Auto-Routed
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition">
                    ✓ Terima & Mulai Cetak
                  </button>
                  <button className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-semibold transition">
                    Cetak SPK
                  </button>
                </div>
              </div>

              {/* Order Card 2 */}
              <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg hover:border-amber-500/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        #BAS-20261022-8321
                      </span>
                      <span className="text-xs text-white/50">25 menit lalu</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold mt-1 text-white">
                      Stiker Vinyl Waterproof A3+ (Kiss-Cut) — 5 Lembar
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Pemesan: <strong className="text-white">Kedai Kopi Nan Duo</strong> • Label Botol 250ml
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                    DIBAYAR
                  </span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition">
                    ✓ Terima & Mulai Cetak
                  </button>
                  <button className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 text-xs font-semibold transition">
                    Cetak SPK
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "production" && (
            <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                      #BAS-20261022-1082
                    </span>
                    <span className="text-xs text-white/50">Sedang diproses</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold mt-1 text-white">
                    Roll Up Banner Luxury 85x200cm
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Pemesan: <strong className="text-white">PT Semen Padang</strong> • Bahan Albatros Luster
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 whitespace-nowrap">
                  DIPRODUKSI
                </span>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-sky-500/20 active:scale-95 transition">
                  ✓ Selesai & Pindah ke Siap Antar
                </button>
              </div>
            </div>
          )}

          {activeTab === "ready" && (
            <div className="bg-[#0B1E36] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      #BAS-20261022-7719
                    </span>
                    <span className="text-xs text-white/50">Siap diambil kurir</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold mt-1 text-white">
                    Kaos Sablon DTF Combed 30s (Hitam - L) — 3 Pcs
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Telah dikemas rapi • Menunggu Kurir Internal menjemput
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                  SIAP_ANTAR
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
