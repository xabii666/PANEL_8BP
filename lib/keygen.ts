import crypto from 'crypto'

export function generateLicenseKey(): string {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase()
  return `CMODZ-${seg()}-${seg()}-${seg()}`
}

export function generateBulkKeys(count: number): string[] {
  return Array.from({ length: count }, () => generateLicenseKey())
}

export function maskKey(key: string): string {
  const parts = key.split('-')
  if (parts.length < 4) return key.slice(0, 8) + '...'
  return `${parts[0]}-${parts[1]}-****-${parts[parts.length - 1]}`
}
