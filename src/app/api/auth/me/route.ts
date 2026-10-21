import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { verifySignedToken, getSessionTokenFromCookies } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      token = (await getSessionTokenFromCookies()) || undefined;
    }

    const signedInfo = token ? verifySignedToken(token) : null;
    const username = signedInfo?.username || "admin";

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          username
        }
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
