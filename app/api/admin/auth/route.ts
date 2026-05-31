import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import sql from '@/lib/db'
import { signToken } from '@/lib/auth'
import { initDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const { username, password } = await req.json()
    if (!username || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })

    const rows = await sql`SELECT * FROM admins WHERE username = ${username} LIMIT 1`
    const admin = rows[0]

    if (!admin) {
      // First-time setup: auto-create admin
      const envPass = process.env.ADMIN_PASSWORD || 'admin123'
      if (password !== envPass) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const hash = await bcrypt.hash(password, 10)
      const [newAdmin] = await sql`INSERT INTO admins (username, password_hash) VALUES (${username}, ${hash}) RETURNING *`
      const token = signToken({ id: newAdmin.id, username: newAdmin.username })
      return NextResponse.json({ token, username: newAdmin.username })
    }

    const valid = await bcrypt.compare(password, admin.password_hash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signToken({ id: admin.id, username: admin.username })
    return NextResponse.json({ token, username: admin.username })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
