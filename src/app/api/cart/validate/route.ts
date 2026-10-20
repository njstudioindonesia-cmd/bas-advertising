import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
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

    const validItems: any[] = [];
    const unavailableItems: any[] = [];
    let hasChanges = false;
    let subtotal = 0;

    for (const item of items) {
      const p = db.prepare(`
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `).get(item.productId) as any;

      if (!p || p.is_active === 0) {
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

      let gallery: string[] = [];
      try {
        if (p.gallery) gallery = JSON.parse(p.gallery);
      } catch {
        gallery = [];
      }

      validItems.push({
        productId: p.id,
        id: p.id,
        name: p.name,
        title: p.name,
        category: p.category_name || "Lainnya",
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
