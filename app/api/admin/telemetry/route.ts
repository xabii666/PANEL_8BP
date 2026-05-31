import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await sql`SELECT * FROM telemetry ORDER BY created_at DESC LIMIT 500`
  return NextResponse.json({ rows })
}
