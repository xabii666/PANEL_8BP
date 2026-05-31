import Sidebar from '@/components/Sidebar'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto bg-bg-primary grid-bg">
        {children}
      </main>
    </div>
  )
}
