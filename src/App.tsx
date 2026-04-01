import { useState } from 'react'
import { useStore } from './store'
import { HomeSelector } from './pages/HomeSelector'
import { HomeDashboard } from './pages/HomeDashboard'
import { Inventory } from './pages/Inventory'
import { Insurance } from './pages/Insurance'
import { Maintenance } from './pages/Maintenance'
import { Emergency } from './pages/Emergency'
import type { Home } from './types'

type Page = 'homes' | 'dashboard' | 'inventory' | 'insurance' | 'maintenance' | 'emergency'

export default function App() {
  const store = useStore()
  const [page, setPage] = useState<Page>('homes')
  const [activeHome, setActiveHome] = useState<Home | null>(null)

  const selectHome = (home: Home) => {
    setActiveHome(home)
    setPage('dashboard')
  }

  if (page === 'homes') {
    return <HomeSelector homes={store.homes} onAddHome={store.addHome} onSelectHome={selectHome} />
  }

  if (!activeHome) return null

  const homeItems = store.items.filter(i => i.homeId === activeHome.id)
  const homeRooms = store.rooms.filter(r => r.homeId === activeHome.id)
  const homePolicies = store.policies.filter(p => p.homeId === activeHome.id)
  const homeMaintenance = store.maintenance.filter(m => m.homeId === activeHome.id)

  return (
    <div className="min-h-screen" style={{background:'#F7F3EB'}}>
      {/* Top nav */}
      <nav style={{background:'#1F3A32'}} className="px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setPage('homes')} className="flex items-center gap-2">
          <span className="text-lg font-display font-bold text-white">Ár mBaile</span>
          <span className="text-xs text-white/50">·</span>
          <span className="text-xs text-white/70">{activeHome.name}</span>
        </button>
        <div className="flex items-center gap-1">
          {([
            { id: 'dashboard', icon: '🏠', label: 'Home' },
            { id: 'inventory', icon: '📦', label: 'Items' },
            { id: 'insurance', icon: '🛡️', label: 'Insurance' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'emergency', icon: '🚨', label: 'Emergency' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${page === tab.id ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
            >
              <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
              <span className="sm:hidden">{tab.icon}</span>
            </button>
          ))}
        </div>
      </nav>

      {page === 'dashboard' && <HomeDashboard home={activeHome} items={homeItems} policies={homePolicies} maintenance={homeMaintenance} rooms={homeRooms} onNavigate={setPage} />}
      {page === 'inventory' && <Inventory home={activeHome} items={homeItems} rooms={homeRooms} onAddRoom={store.addRoom} onAddItem={store.addItem} onUpdateItem={store.updateItem} onDeleteItem={store.deleteItem} />}
      {page === 'insurance' && <Insurance home={activeHome} policies={homePolicies} items={homeItems} onAddPolicy={store.addPolicy} />}
      {page === 'maintenance' && <Maintenance home={activeHome} logs={homeMaintenance} items={homeItems} onAddLog={store.addMaintenance} />}
      {page === 'emergency' && <Emergency home={activeHome} policies={homePolicies} />}
    </div>
  )
}
