import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const isInternal = req.headers.get('x-internal') === 'true'
  if (!isInternal) {
    const admin = getAdminFromHeader(req.headers.get('authorization'))
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalUsersRes, activeLicensesRes, expiredLicensesRes,
      bannedLicensesRes, onlineNowRes, todayActivationsRes, recentRes
    ] = await Promise.all([
      sql`SELECT COUNT(*) FROM users`,
      sql`SELECT COUNT(*) FROM licenses WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW())`,
      sql`SELECT COUNT(*) FROM licenses WHERE expires_at < NOW()`,
      sql`SELECT COUNT(*) FROM licenses WHERE status = 'banned'`,
      sql`SELECT COUNT(*) FROM licenses WHERE last_seen > NOW() - INTERVAL '1 hour'`,
      sql`SELECT COUNT(*) FROM telemetry WHERE created_at > NOW() - INTERVAL '24 hours'`,
      sql`SELECT l.key, u.username, l.device_model, l.last_seen
          FROM licenses l LEFT JOIN users u ON l.user_id = u.id
          WHERE l.last_seen IS NOT NULL ORDER BY l.last_seen DESC LIMIT 10`
    ])

    return NextResponse.json({
      totalUsers:        Number(totalUsersRes[0].count),
      activeLicenses:    Number(activeLicensesRes[0].count),
      expiredLicenses:   Number(expiredLicensesRes[0].count),
      bannedLicenses:    Number(bannedLicensesRes[0].count),
      onlineNow:         Number(onlineNowRes[0].count),
      todayActivations:  Number(todayActivationsRes[0].count),
      recentActivations: recentRes,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
