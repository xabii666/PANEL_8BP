import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'
import { generateLicenseKey } from '@/lib/keygen'

function auth(req: NextRequest) { return getAdminFromHeader(req.headers.get('authorization')) }

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`
    SELECT l.*, u.username
    FROM licenses l LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC LIMIT 500`
  return NextResponse.json({ licenses: rows })
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { userId, days, count = 1, features } = await req.json()
  const expiresAt = new Date(Date.now() + days * 86400000)
  const featureJson = JSON.stringify(features || { autoAim: true, autoPlay: true, autoQueue: true, bypass: true })

  const generated: string[] = []
  for (let i = 0; i < Math.min(count, 50); i++) {
    const key = generateLicenseKey()
    await sql`INSERT INTO licenses (key, user_id, duration_days, expires_at, features, status)
              VALUES (${key}, ${userId || null}, ${days}, ${expiresAt.toISOString()}, ${featureJson}, 'unused')`
    generated.push(key)
  }
  return NextResponse.json({ keys: generated })
}

export async function PUT(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  const action = req.nextUrl.searchParams.get('action')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  if (action === 'revoke') {
    await sql`UPDATE licenses SET status = 'banned' WHERE id = ${Number(id)}`
  } else if (action === 'reset_hwid') {
    await sql`UPDATE licenses SET hwid = NULL, activations = 0 WHERE id = ${Number(id)}`
  } else if (action === 'set_latest') {
    // handled in updates
  } else {
    const body = await req.json()
    const days = body.extend_days
    if (days) {
      await sql`UPDATE licenses SET expires_at = COALESCE(expires_at, NOW()) + (${days} || ' days')::interval WHERE id = ${Number(id)}`
    }
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  await sql`DELETE FROM licenses WHERE id = ${Number(id)}`
  return NextResponse.json({ ok: true })
}
