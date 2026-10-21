import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/db/queries/products";

interface CartValidateItemRequest {
  productId: string;
  qty: number;
  designNote?: string;
  clientPrice?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: CartValidateItemRequest[] = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        unavailableItems: [],
        hasChanges: false,
        subtotal: 0,
        formattedSubtotal: "Rp 0",
      });
    }

    const productIds = items.map((i) => i.productId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(name)")
      .in("id", productIds);

    if (error) {
      throw new Error(error.message);
    }

    const prodMap = new Map<string, any>((products || []).map((p: any) => [p.id, p]));

    const validItems: any[] = [];
    const unavailableItems: any[] = [];
    let hasChanges = false;
    let subtotal = 0;

    for (const item of items) {
      const p = prodMap.get(item.productId);

      if (!p || !p.is_active) {
        unavailableItems.push({
          productId: item.productId,
          reason: !p ? "Produk sudah dihapus" : "Produk sedang tidak aktif",
        });
        hasChanges = true;
        continue;
      }

      const currentPrice = Number(p.price) || 0;
      if (item.clientPrice !== undefined && item.clientPrice !== currentPrice) {
        hasChanges = true;
      }

      const itemTotal = currentPrice * item.qty;
      subtotal += itemTotal;

      validItems.push({
        productId: p.id,
        id: p.id,
        name: p.name,
        title: p.name,
        category: p.categories?.name || "Lainnya",
        price: formatRupiah(currentPrice),
        priceNumber: currentPrice,
        normalPrice: p.compare_at_price ? formatRupiah(Number(p.compare_at_price)) : undefined,
        unit: p.unit || "/ pcs",
        imageUrl: p.image_url,
        img: p.image_url,
        qty: item.qty,
        designNote: item.designNote || "",
        total: itemTotal,
        formattedTotal: formatRupiah(itemTotal),
      });
    }

    return NextResponse.json({
      success: true,
      items: validItems,
      unavailableItems,
      hasChanges,
      subtotal,
      formattedSubtotal: formatRupiah(subtotal),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memvalidasi keranjang" }, { status: 500 });
  }
}
