"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bike,
  MapPin,
  Store,
  Phone,
  MessageSquare,
  ExternalLink,
  Navigation,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

interface LiveOrderTrackingMapProps {
  order: {
    id: string;
    code: string;
    customerName: string;
    status: string;
    statusStep?: number;
    address?: string;
    city?: string;
    hubId?: string;
    destLat?: number;
    destLng?: number;
    shippingMethod?: string;
    driverName?: string;
    driverPhone?: string;
    driverPlate?: string;
    courier?: {
      name?: string;
      phone?: string;
      plate?: string;
      eta?: string;
      notes?: string;
      currentLocation?: [number, number];
    } | null;
  };
}

// Haversine km calculator
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LiveOrderTrackingMap({ order }: LiveOrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // Titik Lokasi Workshop Hub
  const isLubukBuaya =
    order.hubId === "00000000-0000-0000-0000-000000000002" ||
    order.address?.toLowerCase().includes("lubuk buaya") ||
    order.address?.toLowerCase().includes("koto tangah");

  const WORKSHOP_COORDS: [number, number] = isLubukBuaya
    ? [-0.8354, 100.315] // Hub Lubuk Buaya
    : [-0.9025, 100.3542]; // Hub Pusat Belanti Baru

  // Titik Tujuan Pelanggan
  const DESTINATION_COORDS: [number, number] = [
    order.destLat || (isLubukBuaya ? -0.842 : -0.9242),
    order.destLng || (isLubukBuaya ? 100.321 : 100.3626),
  ];

  const isEnRoute =
    order.status === "DALAM_PERJALANAN" ||
    order.status === "KURIR_MENJEMPUT" ||
    order.status === "TIBA" ||
    order.status === "DIKIRIM" ||
    order.status === "SHIPPED";

  // State koordinat kurir terkini
  const [driverPos, setDriverPos] = useState<[number, number]>(() => {
    if (order.courier?.currentLocation) return order.courier.currentLocation;
    if (isEnRoute) {
      // Posisi awal interpolasi antara workshop dan tujuan
      return [
        (WORKSHOP_COORDS[0] + DESTINATION_COORDS[0]) / 2,
        (WORKSHOP_COORDS[1] + DESTINATION_COORDS[1]) / 2,
      ];
    }
    return WORKSHOP_COORDS;
  });

  const [lastUpdatedSec, setLastUpdatedSec] = useState<number>(0);
  const [liveEta, setLiveEta] = useState<string>(() => {
    const dist = calculateDistanceKm(
      driverPos[0],
      driverPos[1],
      DESTINATION_COORDS[0],
      DESTINATION_COORDS[1]
    );
    const mins = Math.max(5, Math.round((dist / 25) * 60)); // rata-rata 25 km/jam motor Padang
    return `${mins} Menit`;
  });

  const driver = {
    name: order.courier?.name || order.driverName || "Fajar Pratama (Kurir Cetak.inc)",
    phone: order.courier?.phone || order.driverPhone || "082283995544",
    vehicle: order.courier?.plate || order.driverPlate || "Honda Vario 160 (BA 4821 QA)",
    statusText:
      order.status === "KURIR_MENJEMPUT"
        ? "Kurir sedang mengambil pesanan cetak Anda di workshop hub"
        : order.status === "DALAM_PERJALANAN"
        ? "Kurir sedang meluncur ke alamat Anda membawa pesanan"
        : order.status === "TIBA"
        ? "Kurir telah tiba di alamat pengiriman Anda"
        : order.status === "SELESAI"
        ? "Pesanan telah sukses diserahterimakan"
        : "Pesanan siap dan menunggu penugasan armada kurir",
  };

  // Lokasi kurir default
  const fetchDriverLiveLocation = useCallback(async () => {
    // Driver portal dinonaktifkan
  }, []);

  useEffect(() => {
    fetchDriverLiveLocation();

    // Polling tiap 8 detik
    const pollInterval = setInterval(() => {
      fetchDriverLiveLocation();
    }, 8000);

    // Counter detik sejak update terakhir
    const timer = setInterval(() => {
      setLastUpdatedSec((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, [fetchDriverLiveLocation]);

  // Inisialisasi Peta Leaflet sekali
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: driverPos,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Carto Voyager Basemap Tile
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // 1. Icon Workshop Cetak.inc
      const workshopIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="
            background: #0B1E36;
            color: white;
            padding: 5px 9px;
            border-radius: 9999px;
            box-shadow: 0 4px 15px rgba(11, 30, 54, 0.4);
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span>🏭</span>
            <span>${isLubukBuaya ? "Hub Lubuk Buaya" : "Hub Pusat BAS"}</span>
          </div>
        `,
        iconSize: [140, 34],
        iconAnchor: [70, 17],
      });
      L.marker(WORKSHOP_COORDS, { icon: workshopIcon }).addTo(map);

      // 2. Icon Lokasi Pelanggan
      const destIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="
            background: #F97316;
            color: white;
            padding: 5px 9px;
            border-radius: 9999px;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 11px;
            font-weight: 800;
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span>📍</span>
            <span>Tujuan: ${order.customerName || "Pelanggan"}</span>
          </div>
        `,
        iconSize: [140, 34],
        iconAnchor: [70, 17],
      });
      L.marker(DESTINATION_COORDS, { icon: destIcon }).addTo(map);

      // 3. Icon Kurir Motor dengan Radar Pulse
      const driverIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 9999px;
              background: rgba(14, 165, 233, 0.35);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 9999px;
              background: #0284C7;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(2, 132, 199, 0.5);
              border: 2.5px solid white;
              font-size: 18px;
              position: relative;
              z-index: 10;
            ">
              🛵
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      const dMarker = L.marker(driverPos, { icon: driverIcon }).addTo(map);
      driverMarkerRef.current = dMarker;

      // 4. Garis Rute (Polyline)
      const routePoints: [number, number][] = [
        WORKSHOP_COORDS,
        driverPos,
        DESTINATION_COORDS,
      ];

      const pLine = L.polyline(routePoints, {
        color: "#F97316",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);
      polylineRef.current = pLine;

      const bounds = L.latLngBounds([WORKSHOP_COORDS, DESTINATION_COORDS, driverPos]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${WORKSHOP_COORDS[0]},${WORKSHOP_COORDS[1]}&destination=${DESTINATION_COORDS[0]},${DESTINATION_COORDS[1]}&travelmode=driving`;
  const waCourierNumber = driver.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md">
      {/* HEADER STATUS BAR */}
      <div className="p-4 bg-gradient-to-r from-[#1E1B4B] to-[#0B1E36] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0 border border-orange-500/30">
            <Navigation size={16} className="fill-[#F97316]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs sm:text-sm leading-tight text-white">
                Live Delivery Tracking
              </h4>
              <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
              </span>
            </div>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Rute Pengiriman {isLubukBuaya ? "Hub Lubuk Buaya" : "Hub Pusat Padang"}
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <span>Buka Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating ETA Badge */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2">
          <Clock size={15} className="text-[#F97316]" />
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">
              Estimasi Tiba
            </span>
            <span className="text-xs font-black text-gray-900">{liveEta}</span>
          </div>
        </div>

        {/* Last Updated Badge */}
        <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono text-white/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {lastUpdatedSec === 0
              ? "Posisi baru saja diperbarui"
              : lastUpdatedSec < 60
              ? `Update ${lastUpdatedSec} dtk lalu`
              : "Update >1 mnt lalu"}
          </span>
        </div>
      </div>

      {/* DRIVER CARD ALA GOJEK / ASTRO */}
      <div className="p-4 sm:p-5 bg-white space-y-3.5 border-t border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0 text-xl font-black shadow-xs">
              🛵
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="font-extrabold text-sm text-gray-900 leading-tight">
                  {driver.name}
                </h5>
                <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  Kurir Toko
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{driver.vehicle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${waCourierNumber}?text=${encodeURIComponent(
                `Halo ${driver.name}, saya ingin menanyakan pesanan Cetak.inc nomor ${order.code}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors shadow-2xs border border-emerald-200 active:scale-95"
              title="Chat WhatsApp Kurir"
            >
              <MessageSquare size={18} />
            </a>
            <a
              href={`tel:${driver.phone}`}
              className="w-10 h-10 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F97316] flex items-center justify-center transition-colors shadow-2xs border border-orange-200 active:scale-95"
              title="Telepon Kurir"
            >
              <Phone size={18} />
            </a>
          </div>
        </div>

        {/* STATUS STEP DESKRIPSI */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100 flex items-start gap-2.5 text-xs text-gray-600">
          <ShieldCheck size={16} className="text-[#F97316] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-gray-900 block">Jaminan Kirim Aman & Tepat Waktu</span>
            <span className="text-[11px] text-gray-500">{driver.statusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
