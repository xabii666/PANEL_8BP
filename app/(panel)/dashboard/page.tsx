import { Users, Key, Activity, ShieldCheck, TrendingUp, Clock } from 'lucide-react'

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_PANEL_URL || ''}/api/admin/dashboard`, {
      cache: 'no-store',
      headers: { 'x-internal': 'true' },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Users',       value: stats?.totalUsers       ?? '—', icon: Users,       color: 'cyan' },
    { label: 'Active Licenses',   value: stats?.activeLicenses   ?? '—', icon: Key,         color: 'green' },
    { label: 'Expired',           value: stats?.expiredLicenses  ?? '—', icon: Clock,       color: 'yellow' },
    { label: 'Banned',            value: stats?.bannedLicenses   ?? '—', icon: ShieldCheck, color: 'red' },
    { label: 'Online (1h)',        value: stats?.onlineNow        ?? '—', icon: Activity,    color: 'purple' },
    { label: 'Activations Today', value: stats?.todayActivations ?? '—', icon: TrendingUp,  color: 'cyan' },
  ]

  const colorMap: Record<string, string> = {
    cyan:   'text-accent-cyan   border-accent-cyan/20   bg-accent-cyan/5',
    green:  'text-accent-green  border-accent-green/20  bg-accent-green/5',
    yellow: 'text-accent-yellow border-accent-yellow/20 bg-accent-yellow/5',
    red:    'text-accent-red    border-accent-red/20    bg-accent-red/5',
    purple: 'text-accent-purple border-accent-purple/20 bg-accent-purple/5',
  }

  const iconColor: Record<string, string> = {
    cyan: 'text-accent-cyan', green: 'text-accent-green',
    yellow: 'text-accent-yellow', red: 'text-accent-red', purple: 'text-accent-purple',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Celz Modz — System Overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`card border ${colorMap[color]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
              <Icon size={14} className={iconColor[color]} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {stats?.recentActivations && (
        <div className="card overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Recent Activations</h2>
          <div className="space-y-2">
            {stats.recentActivations.map((row: { key: string; username: string; device_model: string; last_seen: string }, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0 gap-2">
                <div className="min-w-0">
                  <div className="text-sm text-white font-mono truncate">{row.key}</div>
                  <div className="text-xs text-slate-500 truncate">{row.username} · {row.device_model}</div>
                </div>
                <div className="text-xs text-slate-600 shrink-0">{row.last_seen ? new Date(row.last_seen).toLocaleString() : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
