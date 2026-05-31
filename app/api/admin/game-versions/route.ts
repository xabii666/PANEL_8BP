import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAdminFromHeader(req.headers.get('authorization'))
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`
      SELECT game_version, COUNT(*)::int AS count
      FROM licenses
      WHERE game_version IS NOT NULL AND game_version != ''
      GROUP BY game_version
      ORDER BY count DESC
      LIMIT 20
    `
    return NextResponse.json({ stats: rows })
  } catch {
    return NextResponse.json({ stats: [] })
  }
}
