import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("code") || searchParams.get("q") || "";

    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Harap masukkan nomor pesanan atau nomor WhatsApp yang valid." },
        { status: 400 }
      );
    }

    const clean = query.trim();

    // Cari berdasarkan kode pesanan atau nomor HP
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .or(`code.ilike.%${clean}%,customer_phone.ilike.%${clean}%`)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error || !orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: `Pesanan dengan nomor '${clean}' tidak ditemukan di sistem.` },
        { status: 404 }
      );
    }

    // Mapping timeline status
    const formatOrder = (o: any) => {
      const statusMap: Record<string, { label: string; step: number; desc: string }> = {
        BARU: {
          label: "Pesanan Diterima & Antrian Desain",
          step: 1,
          desc: "Pesanan Anda telah masuk dan menunggu verifikasi resolusi file siap cetak oleh operator kami.",
        },
        DIPROSES: {
          label: "Sedang Naik Mesin Cetak",
          step: 2,
          desc: "File desain sudah siap dan bahan sedang diproses pada mesin digital press / outdoor printer.",
        },
        SIAP: {
          label: "Finishing & Siap Diambil / Dikirim",
          step: 3,
          desc: "Pencetakan telah selesai dan melewati proses pemotongan, laminasi, dan QC keamanan packing.",
        },
        SELESAI: {
          label: "Pesanan Selesai / Telah Diterima",
          step: 4,
          desc: "Pesanan telah diserahkan kepada Anda atau kurir pengiriman. Terima kasih telah mencetak di Cetak.inc!",
        },
        BATAL: {
          label: "Pesanan Dibatalkan",
          step: 0,
          desc: "Pesanan ini telah dibatalkan. Hubungi admin Cetak.inc untuk informasi lebih lanjut.",
        },
      };

      const info = statusMap[o.status] || statusMap["BARU"];

      return {
        id: o.id,
        code: o.code,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        status: o.status,
        statusLabel: info.label,
        statusStep: info.step,
        statusDesc: info.desc,
        deliveryMethod: o.delivery_method,
        address: o.address,
        paymentMethod: o.payment_method,
        subtotal: Number(o.subtotal) || 0,
        createdAt: o.created_at,
        items: (o.order_items || []).map((it: any) => ({
          name: it.product_name,
          qty: it.qty,
          price: Number(it.product_price) || 0,
          subtotal: Number(it.subtotal) || 0,
          designNote: it.design_note,
        })),
      };
    };

    return NextResponse.json({
      success: true,
      data: orders.map(formatOrder),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melacak pesanan" },
      { status: 500 }
    );
  }
}
