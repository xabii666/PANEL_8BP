'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Key, Upload, Activity, LogOut } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/users',      label: 'Users',       icon: Users },
  { href: '/licenses',   label: 'Licenses',    icon: Key },
  { href: '/updates',    label: 'Updates',     icon: Upload },
  { href: '/telemetry',  label: 'Telemetry',   icon: Activity },
]

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()

  function logout() {
    document.cookie = 'panel_token=; max-age=0; path=/'
    router.push('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-bg-secondary border-r border-bg-border flex flex-col">
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold text-sm">⬡</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">FLUX PANEL</div>
            <div className="text-slate-600 text-xs mt-0.5">8BP Control</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
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
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-all">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
