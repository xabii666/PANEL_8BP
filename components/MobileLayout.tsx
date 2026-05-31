'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-bg-secondary border-b border-bg-border sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan font-bold text-xs">⬡</div>
            <span className="text-white font-bold text-sm">FLUX PANEL</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-bg-primary grid-bg">
          {children}
        </main>
      </div>
    </div>
  )
}
