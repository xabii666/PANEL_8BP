import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { key, hwid, device_model, android_version, game_version, features_used, event_type } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    await sql`INSERT INTO telemetry (license_key, hwid, device_model, android_version, game_version, features_used, ip, event_type)
              VALUES (${key || null}, ${hwid || null}, ${device_model || null}, ${android_version || null},
                      ${game_version || null}, ${JSON.stringify(features_used || {})}, ${ip}, ${event_type || 'session'})`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
