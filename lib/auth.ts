import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'changeme-use-env'

export interface AdminPayload {
  id: number
  username: string
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, SECRET) as AdminPayload
  } catch {
    return null
  }
}

export function getAdminFromCookies(): AdminPayload | null {
  const cookieStore = cookies()
  const token = cookieStore.get('panel_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function getAdminFromHeader(authHeader?: string | null): AdminPayload | null {
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  return verifyToken(token)
}
