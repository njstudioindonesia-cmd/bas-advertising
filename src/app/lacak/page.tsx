"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Printer, 
  Scissors, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  FileText, 
  AlertCircle,
  Loader2,
  Sparkles,
  Bike
} from "lucide-react";
import LiveOrderTrackingMap from "@/components/LiveOrderTrackingMap";
import PushNotificationOptIn from "@/components/PushNotificationOptIn";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || searchParams.get("q") || "";

  const [inputCode, setInputCode] = useState(initialCode);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrder = async (query: string) => {
    if (!query || query.trim().length < 3) return;
    setLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setOrders(data.data);
      } else {
        setOrders([]);
        setErrorMsg(data.error || "Pesanan tidak ditemukan. Periksa kembali nomor pesanan Anda.");
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi saat melacak pesanan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputCode);
  };

  const steps = [
    { num: 1, title: "Pesanan Diterima", desc: "Verifikasi file & antrean", icon: Package },
    { num: 2, title: "Sedang Dicetak", desc: "Mesin cetak beroperasi", icon: Printer },
    { num: 3, title: "Finishing & QC", desc: "Potong, laminasi & packing", icon: Scissors },
    { num: 4, title: "Siap / Terkirim", desc: "Siap ambil / meluncur kurir", icon: Bike },
  ];

  const formatRupiah = (val: number) => "Rp " + Math.round(val).toLocaleString("id-ID");

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-20 md:pt-36 pb-28 md:pb-24">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* TOP BREADCRUMB */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-2xs hover:text-[#F97316] transition-all"
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking Mesin & Kurir
          </span>
        </div>

        {/* HEADER HERO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-6 text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Printer size={28} />
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Lacak Pesanan Cetak
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1.5">
            Pantau status pengerjaan cetak spanduk, stiker, dan merchandise Anda secara transparan ala aplikasi modern.
          </p>

          {/* SEARCH BOX FORM */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Nomor Pesanan (contoh: BAS-2026...) atau No. WA"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-all"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Melacak...
                </>
              ) : (
                "Lacak Sekarang"
              )}
            </button>
          </form>
        </div>

        {/* HASIL TRACKING */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-xs text-red-700 font-medium flex items-center justify-center gap-2 mb-6 max-w-md mx-auto">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {orders.map((order) => {
          const currentStep = order.statusStep || 1;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm space-y-6 mb-6"
            >
              {/* TOP STATUS CARD */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#F97316] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/80">
                      {order.code}
                    </span>
                    <span className="text-xs text-gray-400">
                      • {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h2 className="font-extrabold text-base sm:text-lg text-gray-900 mt-2">
                    Pemesan: {order.customerName}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black px-3.5 py-2 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{order.statusLabel}</span>
                </div>
              </div>

              {/* DESKTOP 2-KOLOM (PETA BESAR KIRI, TIMELINE & RINCIAN KANAN) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* KOLOM KIRI: PETA LIVE TRACKING BESAR */}
                <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
                  <LiveOrderTrackingMap order={order} />
                  <PushNotificationOptIn orderCode={order.code} />
                </div>

                {/* KOLOM KANAN: TIMELINE, RINCIAN ITEM, PEMBAYARAN, & AKSI */}
                <div className="lg:col-span-5 space-y-5">
                  {/* TIMELINE PROGRESS ALA GOJEK */}
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-5 border border-gray-100">
                    <div className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4">
                      Tahapan Pengerjaan Cetak:
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 relative">
                      {steps.map((st) => {
                        const isCompleted = currentStep >= st.num;
                        const isCurrent = currentStep === st.num;
                        const Icon = st.icon;

                        return (
                          <div key={st.num} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                isCurrent
                                  ? "bg-[#F97316] text-white ring-2 ring-orange-100"
                                  : isCompleted
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <CheckCircle2 size={18} />
                              ) : (
                                <Icon size={16} />
                              )}
                            </div>

                            <div className="text-left">
                              <span className={`text-[11px] font-bold block leading-tight ${isCurrent ? "text-[#F97316]" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                                {st.title}
                              </span>
                              <span className="text-[10px] text-gray-400 leading-tight">
                                {st.desc}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-gray-200/60 bg-white/60 p-2.5 rounded-xl flex items-center gap-2 text-xs text-gray-600">
                      <Clock size={15} className="text-[#F97316] shrink-0" />
                      <span className="text-[11px]">{order.statusDesc}</span>
                    </div>
                  </div>

                  {/* RINCIAN PRODUK YANG DIPESAN */}
                  <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-100 space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Rincian Item Pesanan:
                    </h3>
                    <div className="space-y-1.5">
                      {order.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white text-xs border border-gray-100/80">
                          <div className="font-semibold text-gray-800">
                            <span>{it.qty}x </span>
                            <span>{it.name}</span>
                            {it.designNote && (
                              <span className="block text-[10px] text-gray-400 italic font-normal">
                                Note: {it.designNote}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-gray-900 shrink-0">
                            {formatRupiah(it.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-200 text-xs sm:text-sm font-extrabold text-gray-900">
                      <span>Total Tagihan:</span>
                      <span className="text-[#F97316] text-base">{formatRupiah(order.subtotal)}</span>
                    </div>
                  </div>

                  {/* STATUS PEMBAYARAN NOTIFIKASI (FASE 4 BLUEPRINT V2) */}
                  {order.status === "MENUNGGU_VERIFIKASI" && (
                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
                      <Clock className="text-amber-600 shrink-0" size={16} />
                      <div>
                        <strong className="block font-bold">Bukti Pembayaran Sedang Diverifikasi</strong>
                        <span className="text-[11px]">Admin Urang Dalam sedang mencocokkan mutasi transfer Anda.</span>
                      </div>
                    </div>
                  )}
                  {order.status === "PEMBAYARAN_DITOLAK" && (
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-red-800">
                      <AlertCircle className="text-red-600 shrink-0" size={16} />
                      <div>
                        <strong className="block font-bold">Bukti Pembayaran Belum Sesuai</strong>
                        <span className="text-[11px]">Mohon periksa kembali nominal atau kirimkan struk transfer yang jelas via WhatsApp.</span>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS: WHATSAPP OPERATOR & NOTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <a
                      href={`https://wa.me/6282283995544?text=${encodeURIComponent(`Halo Cetak.inc, saya ingin menanyakan status pesanan saya dengan nomor: ${order.code}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-2xl border-gray-200 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      <Phone size={14} /> Chat WhatsApp CS
                    </a>
                    <a
                      href={`/invoice/${encodeURIComponent(order.code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-2xl"
                    >
                      <FileText size={14} /> Buka Invoice Resmi
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* HELPER JIKA BELUM CARI */}
        {!hasSearched && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 text-xs text-gray-500 space-y-2 max-w-2xl mx-auto">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F97316]" />
              Tips Melacak Pesanan:
            </h4>
            <p>1. Nomor pesanan berformat <code className="bg-gray-100 px-1 py-0.5 rounded text-orange-600 font-mono">BAS-YYYYMMDD-XXXX</code> yang Anda terima saat checkout.</p>
            <p>2. Anda juga bisa melacak menggunakan <strong>Nomor WhatsApp</strong> yang Anda masukkan saat membuat pesanan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LacakPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Memuat halaman lacak pesanan...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
