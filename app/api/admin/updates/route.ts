import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'

function auth(req: NextRequest) { return getAdminFromHeader(req.headers.get('authorization')) }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM versions ORDER BY created_at DESC`
  return NextResponse.json({ versions: rows })
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { version, changelog, download_url, game_version, min_version } = await req.json()
  if (!version) return NextResponse.json({ error: 'Version required' }, { status: 400 })
  // Set all others as not latest
  await sql`UPDATE versions SET is_latest = false`
  const [row] = await sql`
    INSERT INTO versions (version, changelog, download_url, game_version, min_version, is_latest)
    VALUES (${version}, ${changelog || null}, ${download_url || null}, ${game_version || null}, ${min_version || '1.0.0'}, true)
    RETURNING *`
  return NextResponse.json({ version: row })
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  const action = req.nextUrl.searchParams.get('action')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (action === 'set_latest') {
    await sql`UPDATE versions SET is_latest = false`
    await sql`UPDATE versions SET is_latest = true WHERE id = ${Number(id)}`
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await sql`DELETE FROM versions WHERE id = ${Number(id)}`
  return NextResponse.json({ ok: true })
}
