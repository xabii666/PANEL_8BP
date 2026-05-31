'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface TelRow { id: number; license_key: string | null; hwid: string | null; device_model: string | null; android_version: string | null; game_version: string | null; features_used: Record<string,boolean> | null; ip: string | null; event_type: string; created_at: string }

export default function TelemetryPage() {
  const [rows, setRows] = useState<TelRow[]>([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/telemetry', { headers: { authorization: `Bearer ${token}` } })
    const data = await res.json()
    setRows(data.rows || [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Telemetry</h1>
          <p className="text-slate-500 text-sm">Device activity logs from FLUX HUD</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-bg-border text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Device</th>
              <th className="px-4 py-3 text-left">Android</th>
              <th className="px-4 py-3 text-left">8BP Ver</th>
              <th className="px-4 py-3 text-left">Features</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No telemetry data yet</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b border-bg-border/40 hover:bg-white/2 transition-colors">
                <td className="px-4 py-2 font-mono text-accent-cyan/70">{r.license_key ? r.license_key.slice(0, 14) + '...' : '—'}</td>
                <td className="px-4 py-2 text-slate-400">{r.device_model || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{r.android_version || '—'}</td>
                <td className="px-4 py-2 text-slate-500">{r.game_version || '—'}</td>
                <td className="px-4 py-2">
                  {r.features_used ? (
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(r.features_used).filter(([,v]) => v).map(([k]) => (
                        <span key={k} className="badge-active text-[10px] px-1">{k}</span>
                      ))}
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-2 text-slate-600 font-mono">{r.ip || '—'}</td>
                <td className="px-4 py-2 text-slate-600">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
