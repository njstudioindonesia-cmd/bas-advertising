import { supabaseAdmin } from "@/lib/supabase/admin";
import { OrderInput } from "@/lib/validators";

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string | null;
  nameSnapshot: string;
  priceSnapshot: number;
  unitSnapshot: string | null;
  qty: number;
  designNote: string | null;
  total: number;
}

export interface CourierInfo {
  name: string;
  phone: string;
  plate: string;
  eta: string;
  notes?: string;
  currentLocation?: [number, number];
}

export interface OrderRecord {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  address: string | null;
  paymentMethod: string;
  note: string | null;
  courier?: CourierInfo | null;
  subtotal: number;
  status: string;
  items: OrderItemRecord[];
  createdAt: string;
}

export function extractCourierInfo(rawNote: string | null, rawOrder?: any): { note: string | null; courier: CourierInfo | null } {
  let courier: CourierInfo | null = null;
  let cleanNote = rawNote || "";

  if (rawOrder && rawOrder.courier_name) {
    courier = {
      name: rawOrder.courier_name,
      phone: rawOrder.courier_phone || "",
      plate: rawOrder.courier_plate || "",
      eta: rawOrder.estimated_delivery_at || "15 - 25 Menit",
      notes: rawOrder.delivery_notes || "",
    };
  }

  if (cleanNote && cleanNote.includes("[COURIER_DATA:")) {
    const match = cleanNote.match(/\[COURIER_DATA:([\s\S]*?)\]/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        courier = {
          name: parsed.name || courier?.name || "Kurir Cetak.inc Padang",
          phone: parsed.phone || courier?.phone || "6282283995544",
          plate: parsed.plate || courier?.plate || "BA 4821 QA",
          eta: parsed.eta || courier?.eta || "15 - 25 Menit",
          notes: parsed.notes || courier?.notes || "",
        };
      } catch {}
      cleanNote = cleanNote.replace(/\[COURIER_DATA:[\s\S]*?\]/, "").trim();
    }
  }

  return { note: cleanNote || null, courier };
}

export function generateOrderCode(): string {
  const d = new Date();
  const yyyymmdd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BAS-${yyyymmdd}-${randomSuffix}`;
}

export async function createOrder(
  input: OrderInput
): Promise<{ order: OrderRecord | null; error?: string }> {
  try {
    const productIds = input.items.map((i) => i.productId);
    const { data: prods, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, unit")
      .in("id", productIds);

    if (pErr) {
      return { order: null, error: `Database error: ${pErr.message}` };
    }

    const prodMap = new Map<string, any>((prods || []).map((p: any) => [p.id, p]));

    const itemsToInsert: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of input.items) {
      const prod = prodMap.get(item.productId);
      const unitPrice = prod ? Number(prod.price) : 0;
      const prodName = prod ? prod.name : "Produk Custom";
      const itemSubtotal = unitPrice * item.qty;
      calculatedSubtotal += itemSubtotal;

      const itemId = "item-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      itemsToInsert.push({
        id: itemId,
        product_id: item.productId,
        product_name: prodName,
        product_price: unitPrice,
        qty: item.qty,
        subtotal: itemSubtotal,
        design_note: item.designNote || null,
      });
    }

    const orderId = "ord-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const orderCode = generateOrderCode();
    const now = new Date().toISOString();

    const { error: ordErr } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      code: orderCode,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      delivery_method: input.deliveryMethod,
      address: input.address || null,
      payment_method: input.paymentMethod,
      note: input.note || null,
      subtotal: calculatedSubtotal,
      status: "BARU",
      created_at: now,
      updated_at: now,
    });

    if (ordErr) {
      return { order: null, error: ordErr.message };
    }

    // Insert order items
    const finalItems = itemsToInsert.map((item) => ({
      ...item,
      order_id: orderId,
      created_at: now,
    }));

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(finalItems);
    if (itemsErr) {
      console.error("[SUPABASE] Gagal simpan order_items:", itemsErr.message);
    }

    const createdOrder: OrderRecord = {
      id: orderId,
      code: orderCode,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryMethod: input.deliveryMethod,
      address: input.address || null,
      paymentMethod: input.paymentMethod,
      note: input.note || null,
      subtotal: calculatedSubtotal,
      status: "BARU",
      items: finalItems.map((it) => ({
        id: it.id,
        orderId,
        productId: it.product_id,
        nameSnapshot: it.product_name,
        priceSnapshot: it.product_price,
        unitSnapshot: "/ pcs",
        qty: it.qty,
        designNote: it.design_note,
        total: it.subtotal,
      })),
      createdAt: now,
    };

    return { order: createdOrder };
  } catch (err: any) {
    return { order: null, error: err.message || "Gagal membuat pesanan" };
  }
}

export async function getOrders(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: OrderRecord[]; total: number }> {
  try {
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "SEMUA") {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      const start = options.offset || 0;
      query = query.range(start, start + options.limit - 1);
    }

    const { data, count, error } = await query;
    if (error || !data) {
      console.error("[SUPABASE] Gagal memuat pesanan:", error?.message);
      return { orders: [], total: 0 };
    }

    const orders: OrderRecord[] = data.map((o: any) => {
      const { note: cleanNote, courier } = extractCourierInfo(o.note, o);
      return {
        id: o.id,
        code: o.code,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryMethod: o.delivery_method,
        address: o.address,
        paymentMethod: o.payment_method,
        note: cleanNote,
        courier: courier || null,
        subtotal: Number(o.subtotal) || 0,
        status: o.status,
        items: (o.order_items || []).map((it: any) => ({
          id: it.id,
          orderId: it.order_id,
          productId: it.product_id,
          nameSnapshot: it.name_snapshot || it.product_name,
          priceSnapshot: Number(it.price_snapshot || it.product_price) || 0,
          unitSnapshot: it.unit_snapshot || "/ pcs",
          qty: it.qty,
          designNote: it.design_note,
          total: Number(it.total || it.subtotal) || 0,
        })),
        createdAt: o.created_at,
      };
    });

    return {
      orders,
      total: count !== null ? count : orders.length,
    };
  } catch (err: any) {
    console.error("[SUPABASE_ERR] Error getOrders:", err);
    return { orders: [], total: 0 };
  }
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .or(`id.eq.${id},code.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const { note: cleanNote, courier } = extractCourierInfo(data.note, data);

    return {
      id: data.id,
      code: data.code,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryMethod: data.delivery_method,
      address: data.address,
      paymentMethod: data.payment_method,
      note: cleanNote,
      courier: courier || null,
      subtotal: Number(data.subtotal) || 0,
      status: data.status,
      items: (data.order_items || []).map((it: any) => ({
        id: it.id,
        orderId: it.order_id,
        productId: it.product_id,
        nameSnapshot: it.name_snapshot || it.product_name,
        priceSnapshot: Number(it.price_snapshot || it.product_price) || 0,
        unitSnapshot: it.unit_snapshot || "/ pcs",
        qty: it.qty,
        designNote: it.design_note,
        total: Number(it.total || it.subtotal) || 0,
      })),
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  courierData?: CourierInfo | null
): Promise<boolean> {
  const now = new Date().toISOString();

  if (courierData && (courierData.name || courierData.plate)) {
    // 1. Coba update ke kolom native jika kolom sudah ada di Supabase
    const { error: nativeErr } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        updated_at: now,
        courier_name: courierData.name || null,
        courier_phone: courierData.phone || null,
        courier_plate: courierData.plate || null,
        estimated_delivery_at: courierData.eta || null,
        delivery_notes: courierData.notes || null,
      })
      .or(`id.eq.${id},code.eq.${id}`);

    if (!nativeErr) {
      return true;
    }

    // 2. Jika kolom native belum ada di schema DB, simpan fallback dengan menyisipkan [COURIER_DATA:...] pada kolom note
    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("note")
      .or(`id.eq.${id},code.eq.${id}`)
      .limit(1)
      .maybeSingle();

    const currentNote = existing?.note || "";
    const cleanNote = currentNote.replace(/\[COURIER_DATA:[\s\S]*?\]/, "").trim();
    const newNote = `${cleanNote ? cleanNote + "\n" : ""}[COURIER_DATA:${JSON.stringify(courierData)}]`;

    const { error: fallbackErr } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        note: newNote,
        updated_at: now,
      })
      .or(`id.eq.${id},code.eq.${id}`);

    return !fallbackErr;
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status, updated_at: now })
    .or(`id.eq.${id},code.eq.${id}`);

  return !error;
}
