"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bike, MapPin, Store, Phone, MessageSquare, ExternalLink, Navigation, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
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

export default function LiveOrderTrackingMap({ order }: LiveOrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Titik Lokasi Workshop Cetak.inc di Kota Padang
  const WORKSHOP_COORDS: [number, number] = [-0.9242, 100.3628];
  
  // Titik Lokasi Pengiriman Pelanggan (Padang Selatan / Timur / Koto Tangah)
  const DESTINATION_COORDS: [number, number] = [-0.9415, 100.3765];

  // Titik Posisi Kurir Saat Ini (di antara workshop dan pelanggan)
  const isEnRoute = order.statusStep === 4 || order.status === "DIKIRIM" || order.status === "SHIPPED";
  const DRIVER_COORDS: [number, number] = isEnRoute
    ? [-0.9330, 100.3695]
    : WORKSHOP_COORDS;

  const driver = {
    name: order.courier?.name || order.driverName || "Fajar Pratama (Kurir Cetak.inc)",
    phone: order.courier?.phone || order.driverPhone || "6282283995544",
    vehicle: order.courier?.plate || order.driverPlate || "Honda Vario 160 (BA 4219 QB)",
    eta: order.courier?.eta || (isEnRoute ? "15 - 25 Menit" : "Menunggu Antrean Kurir"),
    statusText: order.courier?.notes || (isEnRoute ? "Kurir sedang meluncur ke alamat Anda membawa pesanan cetak" : "Pesanan sedang dalam proses cetak & finishing"),
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Inisialisasi Peta
      const map = L.map(mapContainerRef.current, {
        center: DRIVER_COORDS,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Tambahkan tile layer modern ala Carto Voyager (mirip style peta Gojek/Google Maps)
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
            padding: 6px 10px;
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
            <span>Workshop Cetak.inc</span>
          </div>
        `,
        iconSize: [140, 36],
        iconAnchor: [70, 18],
      });
      L.marker(WORKSHOP_COORDS, { icon: workshopIcon }).addTo(map);

      // 2. Icon Lokasi Pelanggan
      const destIcon = L.divIcon({
        className: "custom-map-marker",
        html: `
          <div style="
            background: #F97316;
            color: white;
            padding: 6px 10px;
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
        iconSize: [140, 36],
        iconAnchor: [70, 18],
      });
      L.marker(DESTINATION_COORDS, { icon: destIcon }).addTo(map);

      // 3. Icon Kurir Motor dengan Radar Pulse
      if (isEnRoute) {
        const driverIcon = L.divIcon({
          className: "custom-map-marker",
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <div style="
                position: absolute;
                inset: 0;
                border-radius: 9999px;
                background: rgba(34, 197, 94, 0.35);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 9999px;
                background: #16A34A;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(22, 163, 74, 0.5);
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
        L.marker(DRIVER_COORDS, { icon: driverIcon }).addTo(map);
      }

      // 4. Garis Rute (Polyline)
      const routePoints: [number, number][] = [
        WORKSHOP_COORDS,
        [-0.9290, 100.3650],
        DRIVER_COORDS,
        [-0.9380, 100.3730],
        DESTINATION_COORDS,
      ];

      L.polyline(routePoints, {
        color: "#F97316",
        weight: 4,
        opacity: 0.85,
        dashArray: "8, 8",
        lineCap: "round",
      }).addTo(map);

      // Sesuaikan pandangan peta agar mencakup seluruh rute
      const bounds = L.latLngBounds([WORKSHOP_COORDS, DESTINATION_COORDS]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [order]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${WORKSHOP_COORDS[0]},${WORKSHOP_COORDS[1]}&destination=${DESTINATION_COORDS[0]},${DESTINATION_COORDS[1]}&travelmode=driving`;

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
              Rute Pengiriman Area Kota Padang & Sekitarnya
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <span>Google Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating ETA Badge di Sudut Kanan Atas Peta */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-gray-100 flex items-center gap-2">
          <Clock size={15} className="text-[#F97316]" />
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">Estimasi Tiba</span>
            <span className="text-xs font-black text-gray-900">{driver.eta}</span>
          </div>
        </div>
      </div>

      {/* FLOATING DRIVER CARD ALA GOJEK / ASTRO */}
      <div className="p-4 sm:p-5 bg-white space-y-3.5 border-t border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0 text-xl font-black shadow-xs">
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
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                  Kurir Toko
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {driver.vehicle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${driver.name}, saya ingin menanyakan pesanan Cetak.inc nomor ${order.code}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors shadow-2xs border border-emerald-200"
              title="Chat WhatsApp Kurir"
            >
              <MessageSquare size={18} />
            </a>
            <a
              href={`tel:${driver.phone}`}
              className="w-10 h-10 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F97316] flex items-center justify-center transition-colors shadow-2xs border border-orange-200"
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
