import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Celz Modz — 8 Ball Pool',
  description: 'Celz Modz License & Telemetry Manager',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Restore theme from localStorage without flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var a = localStorage.getItem('theme_accent') || 'cyan';
            var m = localStorage.getItem('theme_mode') || 'gradient';
            document.documentElement.setAttribute('data-accent', a);
            document.documentElement.setAttribute('data-gradient', m === 'gradient' ? 'on' : 'off');
          } catch(e) {}
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
