import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'

function auth(req: NextRequest) { return getAdminFromHeader(req.headers.get('authorization')) }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`
    SELECT u.*, COUNT(l.id)::int AS license_count
    FROM users u LEFT JOIN licenses l ON l.user_id = u.id
    GROUP BY u.id ORDER BY u.created_at DESC`
  return NextResponse.json({ users: rows })
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { username, email, telegram, notes } = await req.json()
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 })
  const [row] = await sql`
    INSERT INTO users (username, email, telegram, notes)
    VALUES (${username}, ${email || null}, ${telegram || null}, ${notes || null}) RETURNING *`
  return NextResponse.json({ user: row })
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const body = await req.json()
  const { username, email, telegram, notes, status } = body

  if (status !== undefined) {
    await sql`UPDATE users SET status = ${status} WHERE id = ${id}`
  }
  if (username !== undefined) {
    await sql`UPDATE users SET username=${username}, email=${email||null}, telegram=${telegram||null}, notes=${notes||null} WHERE id = ${id}`
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = Number(req.nextUrl.searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await sql`UPDATE licenses SET user_id = NULL WHERE user_id = ${id}`
  await sql`DELETE FROM users WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}
