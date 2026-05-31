import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { initDB } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const body = await req.json()
    const { key, hwid, device_model, android_version, game_version, lib_version } = body

    if (!key || !hwid) {
      return NextResponse.json({ valid: false, reason: 'missing_params' })
    }

    const rows = await sql`
      SELECT l.*, u.username as username
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.key = ${key}
      LIMIT 1
    `
    const lic = rows[0]

    if (!lic) return NextResponse.json({ valid: false, reason: 'invalid' })
    if (lic.status === 'banned') return NextResponse.json({ valid: false, reason: 'banned' })

    const now = new Date()
    if (lic.expires_at && new Date(lic.expires_at) < now) {
      try { await sql`UPDATE licenses SET status = 'expired' WHERE id = ${lic.id}` } catch (_) {}
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    // ── Update license record (non-fatal) ─────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    try {
      if (!lic.hwid) {
        await sql`
          UPDATE licenses
          SET hwid = ${hwid}, status = 'active', activations = activations + 1,
              last_seen = NOW(), last_ip = ${ip},
              device_model = ${device_model || null},
              android_version = ${android_version || null},
              game_version = ${game_version || null}
          WHERE id = ${lic.id}
        `
      } else {
        if (lic.hwid !== hwid) {
          return NextResponse.json({ valid: false, reason: 'hwid_mismatch' })
        }
        await sql`
          UPDATE licenses
          SET last_seen = NOW(), last_ip = ${ip},
              device_model = ${device_model || null},
              android_version = ${android_version || null},
              game_version = ${game_version || null}
          WHERE id = ${lic.id}
        `
      }
    } catch (updateErr) {
      // Non-fatal: update failed (e.g. missing column) — still allow login
      console.error('license update failed:', updateErr)
    }

    const features = lic.features || { autoAim: true, autoPlay: true, autoQueue: true, bypass: true }
    const daysLeft = lic.expires_at
      ? Math.max(0, Math.ceil((new Date(lic.expires_at).getTime() - now.getTime()) / 86400000))
      : 999

    // ── Auto-update check (non-fatal) ─────────────────────────────────
    let updateAvailable = false
    let latestVersion: string | null = null
    let downloadUrl: string | null = null

    try {
      const verRows = await sql`SELECT * FROM versions WHERE is_latest = true LIMIT 1`
      const latest = verRows[0]
      if (latest) {
        latestVersion = latest.version || null
        downloadUrl = latest.download_url || null
        if (lib_version && latestVersion && lib_version !== latestVersion) {
          updateAvailable = true
        }
      }
    } catch (_) {}

    return NextResponse.json({
      valid: true,
      username: lic.username || 'User',
      expires_at: lic.expires_at,
      days_left: daysLeft,
      features,
      update_available: updateAvailable,
      latest_version: latestVersion,
      download_url: updateAvailable ? downloadUrl : null,
    })
  } catch (e) {
    console.error('[validate] fatal:', e)
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 500 })
  }
}
