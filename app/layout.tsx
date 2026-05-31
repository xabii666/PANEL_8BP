import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FLUX PANEL — 8 Ball Pool',
  description: 'FLUX HUD License & Telemetry Manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
