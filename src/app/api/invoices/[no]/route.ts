import { NextResponse } from "next/server";
import { getInvoiceByNo, getInvoiceByOrderId } from "@/modules/invoices";

export async function GET(
  request: Request,
  context: { params: Promise<{ no: string }> }
) {
  try {
    const { no } = await context.params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || undefined;

    // Coba cari berdasarkan nomor invoice
    let invoice = await getInvoiceByNo(no, token);

    // Jika tidak ditemukan dan param mungkin adalah orderId
    if (!invoice) {
      invoice = await getInvoiceByOrderId(no);
    }

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice tidak ditemukan atau token akses tidak valid." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
