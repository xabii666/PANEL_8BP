'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'

interface Version { id: number; version: string; changelog: string | null; download_url: string | null; is_latest: boolean; game_version: string | null; created_at: string }

export default function UpdatesPage() {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ version: '', changelog: '', download_url: '', game_version: '', min_version: '1.0.0' })

  const token = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/updates', { headers: { authorization: `Bearer ${token}` } })
    const data = await res.json()
    setVersions(data.versions || [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  async function addVersion() {
    await fetch('/api/admin/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
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
          <p className="text-slate-500 text-sm">FLUX HUD version manager</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Add Version
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="card text-center text-slate-500 py-8">Loading...</div>
        ) : versions.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">No versions yet</div>
        ) : versions.map(v => (
          <div key={v.id} className={`card border ${v.is_latest ? 'border-accent-cyan/30 glow-cyan' : 'border-bg-border'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`text-lg font-bold ${v.is_latest ? 'text-accent-cyan' : 'text-white'}`}>v{v.version}</div>
                {v.is_latest && <span className="badge-active">LATEST</span>}
                {v.game_version && <span className="text-xs text-slate-500 font-mono">8BP {v.game_version}</span>}
              </div>
              <div className="flex items-center gap-1">
                {!v.is_latest && (
                  <button onClick={() => setLatest(v.id)} className="p-1.5 hover:text-accent-cyan text-slate-500 transition-colors" title="Set as latest"><Star size={13} /></button>
                )}
                <button onClick={() => deleteVersion(v.id)} className="p-1.5 hover:text-accent-red text-slate-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
            {v.changelog && <p className="text-sm text-slate-400 mt-2 font-mono whitespace-pre-wrap">{v.changelog}</p>}
            {v.download_url && (
              <a href={v.download_url} target="_blank" rel="noreferrer" className="text-xs text-accent-cyan/70 hover:text-accent-cyan mt-2 block break-all transition-colors">
                {v.download_url}
              </a>
            )}
            <div className="text-xs text-slate-600 mt-2">{new Date(v.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg glow-cyan">
            <h2 className="font-bold text-white mb-4">Add New Version</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Version *</label>
                  <input className="input" placeholder="1.0.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Game Version (8BP)</label>
                  <input className="input" placeholder="5.15.0" value={form.game_version} onChange={e => setForm(f => ({ ...f, game_version: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Download URL (.so file)</label>
                <input className="input" placeholder="https://..." value={form.download_url} onChange={e => setForm(f => ({ ...f, download_url: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Min Required Version</label>
                <input className="input" placeholder="1.0.0" value={form.min_version} onChange={e => setForm(f => ({ ...f, min_version: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Changelog</label>
                <textarea className="input h-24 resize-none font-mono text-xs" placeholder="- Fixed auto aim&#10;- Added new feature" value={form.changelog} onChange={e => setForm(f => ({ ...f, changelog: e.target.value }))} />
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
