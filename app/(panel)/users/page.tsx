'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, Ban } from 'lucide-react'

interface User { id: number; username: string; email: string | null; telegram: string | null; status: string; created_at: string; license_count: number }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; user?: User }>({ open: false })
  const [form, setForm] = useState({ username: '', email: '', telegram: '', notes: '' })

  const token = typeof window !== 'undefined' ? document.cookie.match(/panel_token=([^;]+)/)?.[1] : ''

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users', { headers: { authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.telegram || '').toLowerCase().includes(search.toLowerCase())
  )

  async function saveUser() {
    const method = modal.user ? 'PUT' : 'POST'
    const url = modal.user ? `/api/admin/users?id=${modal.user.id}` : '/api/admin/users'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    })
    setModal({ open: false })
    load()
  }

  async function deleteUser(id: number) {
    if (!confirm('Delete user and all licenses?')) return
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
    load()
  }

  async function toggleBan(u: User) {
    await fetch(`/api/admin/users?id=${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: u.status === 'banned' ? 'active' : 'banned' })
    })
    load()
  }

  function openCreate() { setForm({ username: '', email: '', telegram: '', notes: '' }); setModal({ open: true }) }
  function openEdit(u: User) { setForm({ username: u.username, email: u.email || '', telegram: u.telegram || '', notes: '' }); setModal({ open: true, user: u }) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-slate-500 text-sm">{users.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> New User
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-9" placeholder="Search by username or telegram..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Telegram</th>
              <th className="px-4 py-3 text-left">Licenses</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-bg-border/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{u.username}</div>
                  <div className="text-xs text-slate-500">{u.email || '—'}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.telegram ? `@${u.telegram}` : '—'}</td>
                <td className="px-4 py-3 text-slate-400">{u.license_count}</td>
                <td className="px-4 py-3">
                  <span className={u.status === 'active' ? 'badge-active' : 'badge-banned'}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 hover:text-accent-cyan text-slate-500 transition-colors"><Edit2 size={13} /></button>
                    <button onClick={() => toggleBan(u)} className="p-1.5 hover:text-accent-yellow text-slate-500 transition-colors"><Ban size={13} /></button>
                    <button onClick={() => deleteUser(u.id)} className="p-1.5 hover:text-accent-red text-slate-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md glow-cyan">
            <h2 className="font-bold text-white mb-4">{modal.user ? 'Edit User' : 'New User'}</h2>
            <div className="space-y-3">
              <input className="input" placeholder="Username *" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              <input className="input" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="input" placeholder="Telegram (without @)" value={form.telegram} onChange={e => setForm(f => ({ ...f, telegram: e.target.value }))} />
              <textarea className="input h-20 resize-none" placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveUser} className="btn-primary flex-1">Save</button>
              <button onClick={() => setModal({ open: false })} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
