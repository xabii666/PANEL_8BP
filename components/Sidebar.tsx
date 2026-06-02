'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Key, Upload, Activity, LogOut, X, Settings } from 'lucide-react'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users',     label: 'Users',      icon: Users },
  { href: '/licenses',  label: 'Licenses',   icon: Key },
  { href: '/updates',   label: 'Updates',    icon: Upload },
  { href: '/telemetry', label: 'Telemetry',  icon: Activity },
  { href: '/settings',  label: 'Settings',   icon: Settings },
]

interface LicCard {
  username: string | null; key: string; status: string; expires_at: string | null
}

function CountdownTimer({ expiresAt }: { expiresAt: string | null }) {
  const [t, setT] = useState('')
  useEffect(() => {
    if (!expiresAt) { setT('Lifetime'); return }
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setT('EXPIRED'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setT(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  return (
    <span className={clsx('font-mono text-xs tabular-nums', t === 'EXPIRED' ? 'text-accent-red' : 'text-accent-cyan')}>
      {t || '...'}
    </span>
  )
}

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const path = usePathname()
  const router = useRouter()
  const [lic, setLic] = useState<LicCard | null>(null)

  useEffect(() => {
    const tk = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''
    if (!tk) return
    fetch('/api/admin/licenses', { headers: { authorization: `Bearer ${tk}` } })
      .then(r => r.json())
      .then(d => {
        const arr: LicCard[] = d.licenses || []
        const active = arr.find(l => l.status === 'active') || arr[0]
        if (active) setLic({ username: active.username, key: active.key, status: active.status, expires_at: active.expires_at })
      }).catch(() => {})
  }, [])

  function logout() {
    document.cookie = 'panel_token=; max-age=0; path=/'
    router.push('/login')
  }

  const maskKey = (k: string) => {
    const p = k.split('-')
    return p.length >= 4 ? `${p[0]}-****-****-${p[p.length - 1]}` : k.slice(0, 8) + '...'
  }

  const aside = (
    <aside className="w-64 h-full min-h-screen bg-bg-secondary border-r border-bg-border flex flex-col">
      {/* Header with License Info Card */}
      <div className="p-4 border-b border-bg-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold text-xs">⬡</div>
            <span className="text-white font-bold text-sm leading-none">CELZ MODZ PANEL</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* License Detail Card */}
        <div className="rounded-lg border border-accent-cyan/20 bg-bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">License Info</span>
            {lic && (
              <span className={clsx(
                'text-[10px] px-1.5 py-0.5 rounded border font-medium',
                lic.status === 'active'  ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                lic.status === 'expired' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                lic.status === 'banned'  ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                'text-slate-400 bg-slate-500/10 border-slate-500/20'
              )}>{lic.status.toUpperCase()}</span>
            )}
          </div>
          {lic ? (
            <>
              <div>
                <div className="text-white text-sm font-semibold truncate">{lic.username || 'Unassigned'}</div>
                <div className="text-slate-500 font-mono text-[10px] mt-0.5 truncate">{maskKey(lic.key)}</div>
              </div>
              <div className="pt-1.5 border-t border-bg-border">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">CD Expires</div>
                <CountdownTimer expiresAt={lic.expires_at} />
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-600 italic py-1">No active license</div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all duration-150',
              path === href || path.startsWith(href + '/')
                ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-bg-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-all"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">{aside}</div>

      {/* Mobile drawer overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-50 md:hidden transition-all duration-300',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={clsx('absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0')}
          onClick={onClose}
        />
        <div className={clsx('relative h-full transition-transform duration-300', isOpen ? 'translate-x-0' : '-translate-x-full')}>
          {aside}
        </div>
      </div>
    </>
  )
}
