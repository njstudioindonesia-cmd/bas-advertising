import { supabaseAdmin } from "@/lib/supabase/admin";
import { Hub, HubServiceArea } from "./types";

export const FALLBACK_HUBS: Hub[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Hub Pusat BAS Advertising Padang",
    slug: "hub-padang-pusat",
    address: "Jl. Belanti Baru No. 17, Lolong Belanti, Kec. Padang Utara, Kota Padang, Sumatera Barat",
    lat: -0.9025,
    lng: 100.3542,
    phone: "082283995544",
    whatsapp: "6282283995544",
    maxRadiusKm: 25,
    dailyCapacity: 150,
    isActive: true,
    isOpen: true,
    notes: "Workshop Pusat - Fasilitas Cetak Lengkap (Spanduk, Digital A3+, Sablon, Akrilik)",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Hub Lubuk Buaya (Workshop Cabang)",
    slug: "hub-lubuk-buaya",
    address: "Jl. Adinegoro No. 88, Lubuk Buaya, Kec. Koto Tangah, Kota Padang, Sumatera Barat",
    lat: -0.8354,
    lng: 100.315,
    phone: "082283995544",
    whatsapp: "6282283995544",
    maxRadiusKm: 20,
    dailyCapacity: 100,
    isActive: true,
    isOpen: true,
    notes: "Workshop Cabang Utara - Prioritas Pesanan Area Lubuk Buaya & Koto Tangah",
  },
];

export async function getActiveHubs(): Promise<Hub[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("hubs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((h: any) => ({
        id: h.id,
        name: h.name,
        slug: h.slug,
        address: h.address,
        lat: Number(h.lat),
        lng: Number(h.lng),
        phone: h.phone,
        whatsapp: h.whatsapp,
        maxRadiusKm: Number(h.max_radius_km || 15),
        dailyCapacity: Number(h.daily_capacity || 50),
        openingHours: h.opening_hours,
        isActive: h.is_active,
        isOpen: h.is_open,
        notes: h.notes,
        createdAt: h.created_at,
      }));
    }
  } catch (err) {
    console.warn("[HUBS MODULE] DB query gagal, menggunakan fallback hubs:", err);
  }

  return FALLBACK_HUBS;
}

export async function getHubById(id: string): Promise<Hub | null> {
  const hubs = await getActiveHubs();
  return hubs.find((h) => h.id === id) || null;
}
