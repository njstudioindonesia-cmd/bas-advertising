import { supabaseAdmin } from "@/lib/supabase/admin";
import { DriverLocation, DeliveryTask, DeliveryTaskStatus, ShippingTariff } from "./types";
import { publishEvent } from "@/lib/events";

// In-memory cache untuk lokasi driver terkini (ultra-fast read)
const driverLocationCache = new Map<string, DriverLocation>();

// Fallback tarif standar per hub jika database offline
const DEFAULT_TARIFFS: ShippingTariff[] = [
  {
    id: "tariff-pusat",
    hubId: "00000000-0000-0000-0000-000000000001",
    baseFee: 8000,
    perKm: 2500,
    minFee: 8000,
    maxKm: 25,
    freeOver: 300000,
    isActive: true,
  },
  {
    id: "tariff-lubuk-buaya",
    hubId: "00000000-0000-0000-0000-000000000002",
    baseFee: 8000,
    perKm: 2500,
    minFee: 8000,
    maxKm: 20,
    freeOver: 300000,
    isActive: true,
  },
];

export async function upsertDriverLocation(
  driverId: string,
  lat: number,
  lng: number,
  heading?: number,
  speed?: number
): Promise<{ success: boolean; location: DriverLocation }> {
  const now = new Date().toISOString();
  const location: DriverLocation = {
    driverId,
    lat,
    lng,
    heading: heading ?? null,
    speed: speed ?? null,
    updatedAt: now,
  };

  driverLocationCache.set(driverId, location);

  try {
    await supabaseAdmin
      .from("driver_locations")
      .upsert(
        {
          driver_id: driverId,
          lat,
          lng,
          heading: heading ?? null,
          speed: speed ?? null,
          updated_at: now,
        },
        { onConflict: "driver_id" }
      );
  } catch (err) {
    console.warn("[DELIVERY] Gagal menyimpan driver_location ke DB:", err);
  }

  return { success: true, location };
}

export async function getDriverLocation(driverId: string): Promise<DriverLocation | null> {
  if (driverLocationCache.has(driverId)) {
    return driverLocationCache.get(driverId)!;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("driver_locations")
      .select("*")
      .eq("driver_id", driverId)
      .maybeSingle();

    if (!error && data) {
      const loc: DriverLocation = {
        driverId: data.driver_id,
        lat: Number(data.lat),
        lng: Number(data.lng),
        heading: data.heading,
        speed: data.speed,
        updatedAt: data.updated_at,
      };
      driverLocationCache.set(driverId, loc);
      return loc;
    }
  } catch {}

  return null;
}

export async function getDeliveryTaskByOrderId(orderId: string): Promise<DeliveryTask | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_tasks")
      .select("*, drivers(*)")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        orderId: data.order_id,
        driverId: data.driver_id,
        provider: data.provider || "internal",
        status: data.status as DeliveryTaskStatus,
        pickupProofUrl: data.pickup_proof_url,
        dropoffProofUrl: data.dropoff_proof_url,
        etaMin: data.eta_min,
        startedAt: data.started_at,
        finishedAt: data.finished_at,
        driver: data.drivers
          ? {
              id: data.drivers.id,
              fullName: data.drivers.full_name || "Kurir Workshop",
              phone: data.drivers.phone || "082283995544",
              vehicleType: data.drivers.vehicle_type || "Motor",
              plate: data.drivers.plate || "BA 4821 QA",
              isOnline: data.drivers.is_online ?? true,
            }
          : null,
      };
    }
  } catch {}

  return null;
}

/**
 * ==============================================================================
 * MANAJEMEN TARIF ONGKIR (FASE 3 BLUEPRINT V2)
 * ==============================================================================
 */

export async function getShippingTariffs(): Promise<ShippingTariff[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("shipping_tariffs")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.id,
        hubId: t.hub_id,
        baseFee: Number(t.base_fee || 8000),
        perKm: Number(t.per_km || 2500),
        minFee: Number(t.min_fee || 8000),
        maxKm: Number(t.max_km || 25),
        freeOver: t.free_over ? Number(t.free_over) : null,
        isActive: t.is_active ?? true,
      }));
    }
  } catch {}

  return DEFAULT_TARIFFS;
}

export async function getShippingTariffByHub(hubId: string): Promise<ShippingTariff | null> {
  const all = await getShippingTariffs();
  return all.find((t) => t.hubId === hubId) || all[0] || null;
}

export async function upsertShippingTariff(input: {
  id?: string;
  hubId: string;
  baseFee?: number;
  perKm?: number;
  minFee?: number;
  maxKm?: number;
  freeOver?: number | null;
  isActive?: boolean;
}): Promise<{ success: boolean; tariff?: ShippingTariff; error?: string }> {
  try {
    const payload = {
      hub_id: input.hubId,
      base_fee: input.baseFee ?? 8000,
      per_km: input.perKm ?? 2500,
      min_fee: input.minFee ?? 8000,
      max_km: input.maxKm ?? 25,
      free_over: input.freeOver !== undefined ? input.freeOver : 300000,
      is_active: input.isActive ?? true,
    };

    let resultData: any;

    if (input.id && !input.id.startsWith("tariff-")) {
      const { data, error } = await supabaseAdmin
        .from("shipping_tariffs")
        .update(payload)
        .eq("id", input.id)
        .select()
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      resultData = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from("shipping_tariffs")
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        // Coba update jika sudah ada untuk hub_id tsb
        const { data: updData, error: updErr } = await supabaseAdmin
          .from("shipping_tariffs")
          .update(payload)
          .eq("hub_id", input.hubId)
          .select()
          .maybeSingle();

        if (updErr) return { success: false, error: updErr.message };
        resultData = updData;
      } else {
        resultData = data;
      }
    }

    const saved: ShippingTariff = {
      id: resultData?.id || input.id || `tariff_${Date.now()}`,
      hubId: resultData?.hub_id || input.hubId,
      baseFee: Number(resultData?.base_fee || payload.base_fee),
      perKm: Number(resultData?.per_km || payload.per_km),
      minFee: Number(resultData?.min_fee || payload.min_fee),
      maxKm: Number(resultData?.max_km || payload.max_km),
      freeOver: resultData?.free_over ? Number(resultData.free_over) : payload.free_over,
      isActive: resultData?.is_active ?? payload.is_active,
    };

    return { success: true, tariff: saved };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
