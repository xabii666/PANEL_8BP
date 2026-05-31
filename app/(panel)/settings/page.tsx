'use client'
import { useState, useEffect } from 'react'
import { Save, Monitor, Palette } from 'lucide-react'
import clsx from 'clsx'

type AccentColor = 'cyan' | 'purple' | 'green' | 'red' | 'yellow'
type GradientMode = 'gradient' | 'color'

const ACCENTS: { key: AccentColor; label: string; hex: string }[] = [
  { key: 'cyan',   label: 'Cyan',   hex: '#00c8ff' },
  { key: 'purple', label: 'Purple', hex: '#7c3aed' },
  { key: 'green',  label: 'Green',  hex: '#10b981' },
  { key: 'red',    label: 'Red',    hex: '#ef4444' },
  { key: 'yellow', label: 'Yellow', hex: '#f59e0b' },
]

function applyTheme(accent: AccentColor, mode: GradientMode) {
  const html = document.documentElement
  html.setAttribute('data-accent', accent)
  html.setAttribute('data-gradient', mode === 'gradient' ? 'on' : 'off')
}

export default function SettingsPage() {
  const [accent, setAccent] = useState<AccentColor>('cyan')
  const [mode, setMode] = useState<GradientMode>('gradient')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const a = (localStorage.getItem('theme_accent') as AccentColor) || 'cyan'
    const m = (localStorage.getItem('theme_mode') as GradientMode) || 'gradient'
    setAccent(a)
    setMode(m)
    applyTheme(a, m)
  }, [])

  // Auto-disable gradient when color-only mode selected
  function handleModeChange(m: GradientMode) {
    setMode(m)
    applyTheme(accent, m)
  }

  function handleAccentChange(a: AccentColor) {
    setAccent(a)
    applyTheme(a, mode)
  }

  function save() {
    localStorage.setItem('theme_accent', accent)
    localStorage.setItem('theme_mode', mode)
    applyTheme(accent, mode)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Panel appearance and preferences</p>
      </div>

      {/* Display Mode */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Monitor size={15} className="text-accent-cyan" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Display Mode</h2>
        </div>
        <p className="text-xs text-slate-500">Color Only mode automatically disables gradient effects to prevent color conflicts.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('gradient')}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              mode === 'gradient'
                ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan'
                : 'border-bg-border text-slate-400 hover:border-white/20 hover:text-white'
            )}
          >
            <div className="w-12 h-7 rounded relative overflow-hidden border border-current/20">
              <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #00c8ff22, #7c3aed22)'}} />
              <div className="absolute inset-0 grid-bg opacity-50" />
            </div>
            <span className="text-xs font-medium">Gradient Mode</span>
          </button>
          <button
            onClick={() => handleModeChange('color')}
            className={clsx(
              'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
              mode === 'color'
                ? 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan'
                : 'border-bg-border text-slate-400 hover:border-white/20 hover:text-white'
            )}
          >
            <div className="w-12 h-7 rounded relative overflow-hidden border border-current/20 bg-bg-card">
              <div className="absolute inset-y-0 left-0 w-1/2" style={{background:'#00c8ff22'}} />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-white/5" />
            </div>
            <span className="text-xs font-medium">Color Only</span>
            {mode === 'color' && <span className="text-[10px] text-accent-green">Gradient: OFF</span>}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={15} className="text-accent-cyan" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Accent Color</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(({ key, label, hex }) => (
            <button
              key={key}
              onClick={() => handleAccentChange(key)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all',
                accent === key ? 'border-white/40 bg-white/10 text-white' : 'border-bg-border text-slate-400 hover:border-white/20 hover:text-white'
              )}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: hex }} />
              {label}
              {accent === key && <span className="text-[10px] opacity-70">✓</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600">Accent color affects highlight elements and glow effects.</p>
      </div>

      {/* Save */}
      <button onClick={save} className={clsx('btn-primary flex items-center gap-2', saved && 'bg-accent-green/10 border-accent-green text-accent-green')}>
        <Save size={14} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
