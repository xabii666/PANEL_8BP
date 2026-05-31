'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Star, Trash2, Cpu, RefreshCw } from 'lucide-react'

interface Version {
  id: number; version: string; changelog: string | null; download_url: string | null
  is_latest: boolean; game_version: string | null; min_version: string | null; created_at: string
}
interface GameVersionStat { game_version: string; count: number }

export default function UpdatesPage() {
  const [versions, setVersions] = useState<Version[]>([])
  const [gameStats, setGameStats] = useState<GameVersionStat[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ version: '', changelog: '', download_url: '', game_version: '', min_version: '1.0.0' })

  const token = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''

  const load = useCallback(async () => {
    setLoading(true)
    const [vRes, gRes] = await Promise.all([
      fetch('/api/admin/updates', { headers: { authorization: `Bearer ${token}` } }),
      fetch('/api/admin/game-versions', { headers: { authorization: `Bearer ${token}` } }),
    ])
    const vData = await vRes.json()
    setVersions(vData.versions || [])
    if (gRes.ok) {
      const gData = await gRes.json()
      setGameStats(gData.stats || [])
    }
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  async function addVersion() {
    if (!form.version) return
    await fetch('/api/admin/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    setModal(false)
    setForm({ version: '', changelog: '', download_url: '', game_version: '', min_version: '1.0.0' })
    load()
  }

  async function setLatest(id: number) {
    await fetch(`/api/admin/updates?id=${id}&action=set_latest`, { method: 'PUT', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  async function deleteVersion(id: number) {
    if (!confirm('Delete this version?')) return
    await fetch(`/api/admin/updates?id=${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Updates</h1>
          <p className="text-slate-500 text-sm">FLUX HUD version manager · auto-update enabled</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost flex items-center gap-2 !px-3">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Add Version
          </button>
        </div>
      </div>

      {/* Game Version Auto-Detect Stats */}
      {gameStats.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={14} className="text-accent-cyan" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">8BP Game Versions Detected (from devices)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {gameStats.map(s => (
              <div key={s.game_version} className="flex items-center gap-2 px-3 py-1.5 rounded border border-accent-cyan/20 bg-accent-cyan/5">
                <span className="text-xs font-mono text-accent-cyan">v{s.game_version}</span>
                <span className="text-[10px] text-slate-500 bg-bg-secondary px-1.5 py-0.5 rounded">{s.count} device{s.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Update Info Banner */}
      <div className="card border border-accent-green/20 bg-accent-green/5">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shrink-0">
            <RefreshCw size={13} className="text-accent-green" />
          </div>
          <div>
            <div className="text-sm text-white font-medium">Auto-Update Active</div>
            <p className="text-xs text-slate-400 mt-1">
              When a game device validates its license, the server checks <code className="text-accent-cyan text-[10px] bg-bg-secondary px-1 rounded">lib_version</code> against the latest version.
              If different, the response includes <code className="text-accent-cyan text-[10px] bg-bg-secondary px-1 rounded">update_available: true</code> + <code className="text-accent-cyan text-[10px] bg-bg-secondary px-1 rounded">download_url</code>.
              The Lua script handles the download and hot-reload automatically — no reinstall needed.
            </p>
          </div>
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card text-center text-slate-500 py-8">Loading...</div>
        ) : versions.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">No versions yet. Add the first one.</div>
        ) : versions.map(v => (
          <div key={v.id} className={`card border ${v.is_latest ? 'border-accent-cyan/30 glow-cyan' : 'border-bg-border'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`text-lg font-bold ${v.is_latest ? 'text-accent-cyan' : 'text-white'}`}>v{v.version}</div>
                {v.is_latest && <span className="badge-active">LATEST</span>}
                {v.game_version && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-mono border border-bg-border rounded px-2 py-0.5">
                    <Cpu size={10} /> 8BP {v.game_version}
                  </span>
                )}
                {v.min_version && (
                  <span className="text-xs text-slate-600 font-mono">min: v{v.min_version}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!v.is_latest && (
                  <button onClick={() => setLatest(v.id)} className="p-1.5 hover:text-accent-cyan text-slate-500 transition-colors" title="Set as latest"><Star size={13} /></button>
                )}
                <button onClick={() => deleteVersion(v.id)} className="p-1.5 hover:text-accent-red text-slate-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
            {v.changelog && <p className="text-sm text-slate-400 mt-2 font-mono whitespace-pre-wrap text-xs">{v.changelog}</p>}
            {v.download_url && (
              <a href={v.download_url} target="_blank" rel="noreferrer" className="text-xs text-accent-cyan/70 hover:text-accent-cyan mt-2 block break-all transition-colors">
                ↓ {v.download_url}
              </a>
            )}
            <div className="text-xs text-slate-600 mt-2">{new Date(v.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg glow-cyan">
            <h2 className="font-bold text-white mb-4">Add New Version</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">FLUX Lib Version *</label>
                  <input className="input" placeholder="2.0.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">8BP Game Version</label>
                  <input className="input" placeholder="5.15.0" value={form.game_version} onChange={e => setForm(f => ({ ...f, game_version: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Download URL (.so / Lua file)</label>
                <input className="input" placeholder="https://..." value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Min Required Version</label>
                <input className="input" placeholder="1.0.0" value={form.min_version} onChange={e => setForm(f => ({ ...f, min_version: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Changelog</label>
                <textarea className="input h-24 resize-none font-mono text-xs" placeholder={"- Fixed auto aim\n- New game_version support"} value={form.changelog} onChange={e => setForm(f => ({ ...f, changelog: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addVersion} className="btn-primary flex-1">Publish</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
