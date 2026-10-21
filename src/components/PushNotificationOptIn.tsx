"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

interface PushNotificationOptInProps {
  orderCode: string;
}

export default function PushNotificationOptIn({ orderCode }: PushNotificationOptInProps) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribing, setSubscribing] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const handleSubscribe = async () => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    setSubscribing(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const reg = await navigator.serviceWorker.ready;

        // Coba kirim data subscription ke server
        try {
          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            // Gunakan dummy/standard subscription jika VAPID belum dikonfigurasi di server
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (vapidKey) {
              sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidKey,
              });
            }
          }

          if (sub) {
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderCode,
                subscription: sub.toJSON(),
              }),
            });
          }
        } catch (subErr) {
          console.warn("[PUSH_SUB_WARN]", subErr);
        }

        // Tampilkan konfirmasi notifikasi pertama secara lokal
        reg.showNotification("🎉 Notifikasi Live Cetak.inc Aktif!", {
          body: `Anda akan menerima notifikasi otomatis saat pesanan #${orderCode} sedang dicetak atau kurir meluncur.`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [200, 100, 200],
          data: { url: `/lacak?code=${orderCode}` },
        } as any);

        setJustSubscribed(true);
      }
    } catch (err) {
      console.error("Gagal mengaktifkan notifikasi", err);
    } finally {
      setSubscribing(false);
    }
  };

  if (permission === "unsupported") {
    return null;
  }

  if (permission === "granted" || justSubscribed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-emerald-900 block">
              Notifikasi Pengantaran Aktif 🔔
            </span>
            <span className="text-[11px] text-emerald-700">
              Pembaruan status #{orderCode} akan langsung muncul di layar HP Anda.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-800 px-2.5 py-1 rounded-lg shrink-0">
          Tersambung
        </span>
      </div>
    );
  }

  if (permission === "denied") {
    return null; // Don't annoy user if explicitly blocked
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#F97316] flex items-center justify-center shrink-0 shadow-xs">
          <Bell size={20} className="animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black text-gray-900">
              Aktifkan Notifikasi Live Pengantaran
            </h4>
            <span className="text-[9px] uppercase font-bold tracking-wider bg-orange-100 text-[#F97316] px-1.5 py-0.5 rounded">
              Astro / Gojek Style
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
            Dapatkan notifikasi otomatis saat mesin mulai mencetak dan saat kurir berangkat ke lokasi Anda.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={subscribing}
        onClick={handleSubscribe}
        className="w-full sm:w-auto px-4 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-200 transition-all shrink-0 disabled:opacity-50"
      >
        {subscribing ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Menghubungkan...
          </>
        ) : (
          <>
            <Bell size={14} /> Aktifkan di HP
          </>
        )}
      </button>
    </div>
  );
}
