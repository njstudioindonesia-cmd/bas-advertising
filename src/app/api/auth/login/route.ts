import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateAdmin } from "@/lib/auth/session";
import { LoginInputSchema } from "@/lib/validators";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/rate-limit";
import { logAudit } from "@/lib/db/queries/audit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateCheck = checkLoginRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${rateCheck.retryAfterSeconds} detik.` 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = LoginInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;
    const result = await authenticateAdmin(username, password);

    if (!result.success || !result.token) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || "Username atau password salah.",
          remainingAttempts: rateCheck.remainingAttempts 
        },
        { status: 401 }
      );
    }

    resetLoginRateLimit(ip);

    const cookieStore = await cookies();
    cookieStore.set("bas_admin_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    logAudit({
      actor: username,
      action: "LOGIN",
      entity: "auth",
      diff: { ip },
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil sebagai Urang Dalam BAS ADV",
      token: result.token,
      user: { username }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
