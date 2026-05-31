import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import sql from "@/lib/db"
import { initDB } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const { secret, username, new_password } = await req.json()
    const envPass = process.env.ADMIN_PASSWORD || "admin123"
    if (!secret || secret !== envPass) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!username || !new_password) {
      return NextResponse.json({ error: "Missing username or new_password" }, { status: 400 })
    }
    const hash = await bcrypt.hash(new_password, 10)
    await sql`DELETE FROM admins`
    await sql`INSERT INTO admins (username, password_hash) VALUES (${username}, ${hash})`
    return NextResponse.json({ ok: true, message: "Admin reset and recreated with new password." })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
