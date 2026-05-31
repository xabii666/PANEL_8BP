'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Copy, Ban, RefreshCw, Trash2, Check } from 'lucide-react'

interface License {
  id: number; key: string; username: string | null; hwid: string | null
  duration_days: number; expires_at: string | null; status: string
  activations: number; last_seen: string | null; device_model: string | null
  features: { autoAim: boolean; autoPlay: boolean; autoQueue: boolean; bypass: boolean }
  created_at: string
}
interface User { id: number; username: string }

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [genForm, setGenForm] = useState({
    userId: '', days: '30', count: '1',
    autoAim: true, autoPlay: true, autoQueue: true, bypass: true
  })

  const token = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''

  const load = useCallback(async () => {
    setLoading(true)
    const [lr, ur] = await Promise.all([
      fetch('/api/admin/licenses', { headers: { authorization: `Bearer ${token}` } }),
      fetch('/api/admin/users', { headers: { authorization: `Bearer ${token}` } })
    ])
    const [ld, ud] = await Promise.all([lr.json(), ur.json()])
    setLicenses(ld.licenses || [])
    setUsers(ud.users || [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = licenses.filter(l =>
    l.key.toLowerCase().includes(search.toLowerCase()) ||
    (l.username || '').toLowerCase().includes(search.toLowerCase())
  )

  async function generate() {
    await fetch('/api/admin/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({
        userId: genForm.userId ? Number(genForm.userId) : null,
        days: Number(genForm.days),
        count: Number(genForm.count),
        features: { autoAim: genForm.autoAim, autoPlay: genForm.autoPlay, autoQueue: genForm.autoQueue, bypass: genForm.bypass }
      })
    })
    setModal(false)
    load()
  }

  async function revoke(id: number) {
    if (!confirm('Revoke this license?')) return
    await fetch(`/api/admin/licenses?id=${id}&action=revoke`, { method: 'PUT', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  async function resetHwid(id: number) {
    await fetch(`/api/admin/licenses?id=${id}&action=reset_hwid`, { method: 'PUT', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  async function deleteLicense(id: number) {
    if (!confirm('Delete license?')) return
    await fetch(`/api/admin/licenses?id=${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  function copyKey(id: number, key: string) {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const maskKey = (k: string) => { const p = k.split('-'); return p.length >= 4 ? `${p[0]}-${p[1]}-****-${p[p.length - 1]}` : k }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Licenses</h1>
          <p className="text-slate-500 text-sm">{licenses.length} total</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Generate Key
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search key or username..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Device</th>
              <th className="px-4 py-3 text-left">Last Seen</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No licenses</td></tr>
            ) : filtered.map(l => {
              const isExpired = l.expires_at && new Date(l.expires_at) < new Date()
              const daysLeft = l.expires_at ? Math.max(0, Math.ceil((new Date(l.expires_at).getTime() - Date.now()) / 86400000)) : null
              return (
                <tr key={l.id} className="border-b border-bg-border/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">
                    <div className="text-accent-cyan">{maskKey(l.key)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{l.username || <span className="text-slate-600 italic">unassigned</span>}</td>
                  <td className="px-4 py-3">
                    {l.expires_at ? (
                      <div>
                        <div className={`text-xs ${isExpired ? 'text-red-400' : 'text-white'}`}>{new Date(l.expires_at).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-600">{isExpired ? 'expired' : `${daysLeft}d left`}</div>
                      </div>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge-${l.status}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{l.device_model || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{l.last_seen ? new Date(l.last_seen).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyKey(l.id, l.key)} className="p-1.5 hover:text-accent-cyan text-slate-500 transition-colors" title="Copy key">
                        {copied === l.id ? <Check size={13} className="text-accent-green" /> : <Copy size={13} />}
                      </button>
                      <button onClick={() => resetHwid(l.id)} className="p-1.5 hover:text-accent-yellow text-slate-500 transition-colors" title="Reset HWID"><RefreshCw size={13} /></button>
                      <button onClick={() => revoke(l.id)} className="p-1.5 hover:text-accent-yellow text-slate-500 transition-colors" title="Revoke"><Ban size={13} /></button>
                      <button onClick={() => deleteLicense(l.id)} className="p-1.5 hover:text-accent-red text-slate-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md glow-cyan">
            <h2 className="font-bold text-white mb-4">Generate License Key</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Assign to user (optional)</label>
                <select className="input" value={genForm.userId} onChange={e => setGenForm(f => ({ ...f, userId: e.target.value }))}>
                  <option value="">— Unassigned —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Duration (days)</label>
                  <input type="number" className="input" min={1} value={genForm.days} onChange={e => setGenForm(f => ({ ...f, days: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Quantity</label>
                  <input type="number" className="input" min={1} max={50} value={genForm.count} onChange={e => setGenForm(f => ({ ...f, count: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Features</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['autoAim','autoPlay','autoQueue','bypass'] as const).map(f => (
                    <label key={f} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={genForm[f]} onChange={e => setGenForm(fg => ({ ...fg, [f]: e.target.checked }))} className="accent-accent-cyan" />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={generate} className="btn-primary flex-1">Generate</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
