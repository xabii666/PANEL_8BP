import { NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json()
    const envPass = process.env.ADMIN_PASSWORD || "admin123"
    if (secret !== envPass) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    await sql`DELETE FROM admins`
    return NextResponse.json({ ok: true, message: "Admin reset. Login again to recreate." })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
