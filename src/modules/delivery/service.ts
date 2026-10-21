import { supabaseAdmin } from "@/lib/supabase/admin";
import { DriverLocation, DeliveryTask, DeliveryTaskStatus } from "./types";
import { publishEvent } from "@/lib/events";

// In-memory cache untuk lokasi driver terkini (ultra-fast read)
const driverLocationCache = new Map<string, DriverLocation>();

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

  // Simpan di in-memory cache
  driverLocationCache.set(driverId, location);

  // Simpan di DB Supabase secara asinkron
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
