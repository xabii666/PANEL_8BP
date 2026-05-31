import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { initDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const body = await req.json()
    const { key, hwid, device_model, android_version, game_version } = body

    if (!key || !hwid) return NextResponse.json({ valid: false, reason: 'missing_params' })

    const rows = await sql`SELECT l.*, u.username FROM licenses l LEFT JOIN users u ON l.user_id = u.id WHERE l.key = ${key} LIMIT 1`
    const lic = rows[0]

    if (!lic) return NextResponse.json({ valid: false, reason: 'invalid' })
    if (lic.status === 'banned') return NextResponse.json({ valid: false, reason: 'banned' })

    // Check expiry
    if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
      await sql`UPDATE licenses SET status = 'expired' WHERE id = ${lic.id}`
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    // HWID binding: bind on first use, then enforce
    if (!lic.hwid) {
      await sql`UPDATE licenses SET hwid = ${hwid}, status = 'active', activations = activations + 1,
                last_seen = NOW(), last_ip = ${req.headers.get('x-forwarded-for') || 'unknown'},
                device_model = ${device_model || null}, android_version = ${android_version || null},
                game_version = ${game_version || null}
                WHERE id = ${lic.id}`
    } else {
      if (lic.hwid !== hwid) return NextResponse.json({ valid: false, reason: 'hwid_mismatch' })
      await sql`UPDATE licenses SET last_seen = NOW(), last_ip = ${req.headers.get('x-forwarded-for') || 'unknown'},
                device_model = ${device_model || null}, android_version = ${android_version || null},
                game_version = ${game_version || null}
                WHERE id = ${lic.id}`
    }

    const features = lic.features || { autoAim: true, autoPlay: true, autoQueue: true, bypass: true }
    const daysLeft = lic.expires_at ? Math.max(0, Math.ceil((new Date(lic.expires_at).getTime() - Date.now()) / 86400000)) : 999

    return NextResponse.json({
      valid: true,
      username: lic.username || 'User',
      expires_at: lic.expires_at,
      days_left: daysLeft,
      features,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 500 })
  }
}
