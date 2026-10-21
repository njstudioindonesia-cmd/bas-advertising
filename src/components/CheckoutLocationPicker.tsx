"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Home,
  Briefcase,
  RefreshCw,
  Truck,
  Sparkles,
} from "lucide-react";

export interface DeliveryLocationData {
  address: string;
  lat: number;
  lng: number;
  landmarkNote: string;
  hubId: string;
  hubName: string;
  distanceKm: number;
  deliveryFee: number;
  etaMin: number;
}

interface Props {
  onLocationChange: (data: DeliveryLocationData) => void;
  subtotal: number;
}

const PADANG_POPULAR_AREAS = [
  { name: "Lubuk Buaya", lat: -0.8354, lng: 100.315 },
  { name: "Koto Tangah", lat: -0.83, lng: 100.32 },
  { name: "Lolong Belanti (Workshop Pusat)", lat: -0.9025, lng: 100.3542 },
  { name: "Ulak Karang", lat: -0.912, lng: 100.352 },
  { name: "Padang Barat", lat: -0.932, lng: 100.358 },
  { name: "Padang Timur", lat: -0.941, lng: 100.375 },
];

export default function CheckoutLocationPicker({ onLocationChange, subtotal }: Props) {
  const [lat, setLat] = useState<number>(-0.9025);
  const [lng, setLng] = useState<number>(100.3542);
  const [address, setAddress] = useState<string>("Jl. Belanti Baru, Lolong Belanti, Padang Utara");
  const [landmarkNote, setLandmarkNote] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Hub & Tariff state
  const [assignedHub, setAssignedHub] = useState<{ id: string; name: string; slug: string }>({
    id: "00000000-0000-0000-0000-000000000001",
    name: "Hub Pusat BAS Advertising Padang",
    slug: "hub-padang-pusat",
  });
  const [distanceKm, setDistanceKm] = useState<number>(1.5);
  const [deliveryFee, setDeliveryFee] = useState<number>(8000);
  const [etaMin, setEtaMin] = useState<number>(15);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // 1. Fetch Shipping Quote & Hub Assignment
  const calculateShippingAndHub = async (targetLat: number, targetLng: number, currentAddress: string) => {
    setIsCalculating(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toLat: targetLat,
          toLng: targetLng,
          subtotal,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const q = data.data;
        const hub = q.hub || {
          id: "00000000-0000-0000-0000-000000000001",
          name: "Hub Pusat BAS Advertising Padang",
          slug: "hub-padang-pusat",
        };

        // Cek override aturan nama area Lubuk Buaya
        const lowerAddr = currentAddress.toLowerCase();
        let finalHub = hub;
        if (lowerAddr.includes("lubuk buaya") || lowerAddr.includes("koto tangah")) {
          finalHub = {
            id: "00000000-0000-0000-0000-000000000002",
            name: "Hub Lubuk Buaya (Workshop Cabang)",
            slug: "hub-lubuk-buaya",
          };
        }

        setAssignedHub(finalHub);
        setDistanceKm(q.distanceKm);
        setDeliveryFee(q.price);
        setEtaMin(q.etaMin);

        onLocationChange({
          address: currentAddress,
          lat: targetLat,
          lng: targetLng,
          landmarkNote,
          hubId: finalHub.id,
          hubName: finalHub.name,
          distanceKm: q.distanceKm,
          deliveryFee: q.price,
          etaMin: q.etaMin,
        });
      }
    } catch {
      // Fallback manual default
      onLocationChange({
        address: currentAddress,
        lat: targetLat,
        lng: targetLng,
        landmarkNote,
        hubId: assignedHub.id,
        hubName: assignedHub.name,
        distanceKm,
        deliveryFee,
        etaMin,
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // 2. Initialize Leaflet Map on Client
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Marker Pin Custom yang bisa digeser (draggable)
        const pinIcon = L.divIcon({
          className: "custom-delivery-pin",
          html: `
            <div style="position:relative; display:flex; flex-direction:column; align-items:center; cursor:grab;">
              <div style="background:#EF4444; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 14px rgba(239,68,68,0.4); border:2.5px solid white;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style="background:#1E1B4B; color:white; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px; margin-top:2px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                Geser Pin
              </div>
            </div>
          `,
          iconSize: [34, 52],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([lat, lng], {
          draggable: true,
          icon: pinIcon,
        }).addTo(map);

        // Event saat pin selesai digeser pengguna
        marker.on("dragend", async () => {
          const newPos = marker.getLatLng();
          setLat(newPos.lat);
          setLng(newPos.lng);
          setStatusMessage("Mendeteksi alamat dari titik pin...");

          try {
            const res = await fetch(`/api/geo/reverse?lat=${newPos.lat}&lng=${newPos.lng}`);
            const json = await res.json();
            if (json.success && json.data) {
              const detectedAddr = json.data.formattedAddress;
              setAddress(detectedAddr);
              calculateShippingAndHub(newPos.lat, newPos.lng, detectedAddr);
              setStatusMessage("Titik lokasi & alamat berhasil disesuaikan.");
            }
          } catch {
            calculateShippingAndHub(newPos.lat, newPos.lng, address);
          }
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update marker position if lat/lng changed
  const updateMapPosition = (newLat: number, newLng: number, newAddr: string) => {
    setLat(newLat);
    setLng(newLng);
    setAddress(newAddr);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 15);
      markerRef.current.setLatLng([newLat, newLng]);
    }

    calculateShippingAndHub(newLat, newLng, newAddr);
  };

  // 3. Deteksi Lokasi Browser ("📍 Gunakan Lokasi Saya")
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi otomatis.");
      return;
    }

    setIsLocating(true);
    setStatusMessage("Meminta koordinat GPS akurat...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = pos.coords.latitude;
        const curLng = pos.coords.longitude;

        try {
          const res = await fetch(`/api/geo/reverse?lat=${curLat}&lng=${curLng}`);
          const json = await res.json();
          const detected = json.data?.formattedAddress || `Titik Koordinat (${curLat.toFixed(4)}, ${curLng.toFixed(4)})`;

          updateMapPosition(curLat, curLng, detected);
          setStatusMessage("Lokasi Anda berhasil terdeteksi!");
        } catch {
          updateMapPosition(curLat, curLng, `Titik Koordinat (${curLat.toFixed(4)}, ${curLng.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setStatusMessage("Izin GPS tidak diberikan. Silakan pilih area atau geser pin di peta.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 4. Autocomplete Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data || []);
        }
      } catch {}
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isLubukBuayaHub = assignedHub.slug === "hub-lubuk-buaya";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header & Auto Location Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-orange-500" /> Titik Lokasi & Alamat Antar
          </h3>
          <p className="text-xs text-gray-500">
            Pesanan otomatis dicetak di cabang workshop terdekat dari lokasi Anda
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isLocating}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold transition active:scale-95 disabled:opacity-60"
        >
          {isLocating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>Gunakan Lokasi Saya</span>
        </button>
      </div>

      {/* Search Autocomplete Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari jalan, kelurahan, atau gedung di Padang (mis: Lubuk Buaya)..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
        />

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  updateMapPosition(item.lat, item.lng, item.formattedAddress);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/60 text-xs text-gray-800 transition flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{item.formattedAddress}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Padang Area Chips */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Pilih Cepat Area Layanan Padang:</p>
        <div className="flex flex-wrap gap-1.5">
          {PADANG_POPULAR_AREAS.map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => updateMapPosition(area.lat, area.lng, `${area.name}, Kota Padang`)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                address.toLowerCase().includes(area.name.toLowerCase())
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Leaflet Draggable Pin Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 h-48 sm:h-56 bg-gray-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction overlay */}
        <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-700 border border-gray-200 shadow-xs flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Geser pin merah ke lokasi spesifik Anda
        </div>
      </div>

      {/* Alamat Terdeteksi & Input Patokan */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Alamat Pengiriman Lengkap
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationChange({
                address: e.target.value,
                lat,
                lng,
                landmarkNote,
                hubId: assignedHub.id,
                hubName: assignedHub.name,
                distanceKm,
                deliveryFee,
                etaMin,
              });
            }}
            placeholder="Alamat jalan, nomor rumah, RT/RW..."
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Patokan / Catatan Rumah (Opsional)
          </label>
          <input
            type="text"
            value={landmarkNote}
            onChange={(e) => {
              setLandmarkNote(e.target.value);
              onLocationChange({
                address,
                lat,
                lng,
                landmarkNote: e.target.value,
                hubId: assignedHub.id,
                hubName: assignedHub.name,
                distanceKm,
                deliveryFee,
                etaMin,
              });
            }}
            placeholder="Contoh: Pagar hitam depan musholla, samping warung kelontong"
            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Auto-Assigned Hub & Tariff Info Banner */}
      <div
        className={`rounded-xl p-3.5 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLubukBuayaHub
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-blue-50/80 border-blue-200 text-blue-900"
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
              isLubukBuayaHub ? "bg-emerald-600" : "bg-blue-600"
            }`}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">{assignedHub.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
                Auto-Routed
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              Jarak antrean: <strong>{distanceKm} km</strong> • Estimasi siap antar: <strong>~{etaMin} menit</strong>
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-current/20 sm:pl-3">
          <span className="text-[10px] uppercase font-bold opacity-70 block">Ongkir Kurir Internal</span>
          <span className="text-sm font-black text-gray-900">
            {deliveryFee === 0 ? "GRATIS" : `Rp ${deliveryFee.toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>
    </div>
  );
}
