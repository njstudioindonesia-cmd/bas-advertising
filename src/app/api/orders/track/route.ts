import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractCourierInfo } from "@/lib/db/queries/orders";

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
          label: "Finishing Selesai & Quality Control",
          step: 3,
          desc: "Pencetakan telah selesai dan melewati proses pemotongan, laminasi, dan QC keamanan packing.",
        },
        DIKIRIM: {
          label: "Kurir Sedang Meluncur ke Alamat Anda",
          step: 4,
          desc: "Kurir sedang dalam perjalanan menuju lokasi Anda. Pantau rute pengantaran secara langsung pada peta.",
        },
        SHIPPED: {
          label: "Kurir Sedang Meluncur ke Alamat Anda",
          step: 4,
          desc: "Kurir sedang dalam perjalanan menuju lokasi Anda. Pantau rute pengantaran secara langsung pada peta.",
        },
        SELESAI: {
          label: "Pesanan Selesai / Telah Diterima",
          step: 4,
          desc: "Pesanan telah diserahkan dan diterima dengan baik. Terima kasih telah mencetak di Cetak.inc!",
        },
        BATAL: {
          label: "Pesanan Dibatalkan",
          step: 0,
          desc: "Pesanan ini telah dibatalkan. Hubungi admin Cetak.inc untuk informasi lebih lanjut.",
        },
      };

      const info = statusMap[o.status] || statusMap["BARU"];
      const { note: cleanNote, courier } = extractCourierInfo(o.note, o);

      const isEnRoute = o.status === "DIKIRIM" || o.status === "SHIPPED";
      const courierData = courier || (isEnRoute ? {
        name: "Kurir Cetak.inc Padang",
        phone: "6282283995544",
        plate: "BA 4821 QA",
        eta: "15 - 25 Menit",
        notes: "Kurir sedang dalam perjalanan menuju lokasi Anda dengan aman",
        currentLocation: [-0.9325, 100.3698] as [number, number],
      } : null);

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
        note: cleanNote,
        courier: courierData,
        driverName: courierData?.name,
        driverPhone: courierData?.phone,
        driverPlate: courierData?.plate,
        subtotal: Number(o.subtotal) || 0,
        createdAt: o.created_at,
        items: (o.order_items || []).map((it: any) => ({
          name: it.name_snapshot || it.product_name || "Item Cetak",
          qty: it.qty,
          price: Number(it.price_snapshot || it.product_price) || 0,
          subtotal: Number(it.total || it.subtotal) || 0,
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
