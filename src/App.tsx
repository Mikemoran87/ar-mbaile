import { useState } from 'react'
import { useStore } from './store'
import { usePinLock, PinScreen } from './components/PinLock'
import { HomeSelector } from './pages/HomeSelector'
import { HomeDashboard } from './pages/HomeDashboard'
import { Inventory } from './pages/Inventory'
import { Insurance } from './pages/Insurance'
import { Maintenance } from './pages/Maintenance'
import { Emergency } from './pages/Emergency'
import { Finishes } from './pages/Finishes'
import { Renovations } from './pages/Renovations'
import { Tradespeople } from './pages/Tradespeople'
import { generateHomeReport } from './utils/exportPDF'
import type { Home } from './types'

type Page = 'homes' | 'dashboard' | 'inventory' | 'insurance' | 'maintenance' | 'emergency' | 'finishes' | 'renovations' | 'tradespeople'

const NAV: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard',    icon: '🏠', label: 'Home' },
  { id: 'inventory',   icon: '📦', label: 'Items' },
  { id: 'finishes',    icon: '🎨', label: 'Finishes' },
  { id: 'insurance',   icon: '🛡️', label: 'Insurance' },
  { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
  { id: 'renovations', icon: '🏗️', label: 'Projects' },
  { id: 'tradespeople',icon: '👷', label: 'Trades' },
  { id: 'emergency',   icon: '🚨', label: 'Emergency' },
]

export default function App() {
  const store = useStore()
  const [page, setPage] = useState<Page>('homes')
  const [activeHome, setActiveHome] = useState<Home | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pinLock = usePinLock()
  const [pinUnlocked, setPinUnlocked] = useState(() => pinLock.isUnlocked())

  // Show PIN screen if locked
  if (!pinUnlocked) {
    return <PinScreen mode="unlock" onSuccess={() => setPinUnlocked(true)} />
  }

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
  const homeFinishes = store.finishes.filter(f => f.homeId === activeHome.id)
  const homeRenovations = store.renovations.filter(r => r.homeId === activeHome.id)
  const homeTradespeople = store.tradespeople.filter(t => t.homeId === activeHome.id)

  const handleExport = () => generateHomeReport({
    home: activeHome,
    items: homeItems,
    policies: homePolicies,
    maintenance: homeMaintenance,
    finishes: homeFinishes,
    renovations: homeRenovations,
    tradespeople: homeTradespeople,
  })

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EB' }}>
      {/* Top nav */}
      <nav style={{ background: '#1F3A32' }} className="px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setPage('homes')} className="flex items-center gap-2">
          <span className="font-display font-bold text-white text-lg">Ár mBaile</span>
          <span className="text-white/40 text-xs hidden sm:inline">· {activeHome.name}</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(tab => (
            <button key={tab.id} onClick={() => setPage(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${page === tab.id ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
          <button onClick={handleExport} className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all">
            📤 Export
          </button>
          {pinLock.hasPin && (
            <button onClick={() => { pinLock.lock(); setPinUnlocked(false) }} className="ml-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-all">
              🔒 Lock
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={handleExport} className="text-white/60 text-sm px-2 py-1.5">📤</button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white text-sm font-semibold px-2 py-1.5">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden sticky top-[52px] z-40 shadow-lg" style={{ background: '#1F3A32' }}>
          <div className="grid grid-cols-4 gap-0">
            {NAV.map(tab => (
              <button key={tab.id} onClick={() => { setPage(tab.id); setMobileMenuOpen(false) }}
                className={`flex flex-col items-center py-3 px-1 text-xs transition-all ${page === tab.id ? 'bg-white/20 text-white' : 'text-white/60'}`}>
                <span className="text-base mb-0.5">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {page === 'dashboard'    && <HomeDashboard home={activeHome} items={homeItems} policies={homePolicies} maintenance={homeMaintenance} rooms={homeRooms} onNavigate={setPage} />}
      {page === 'inventory'    && <Inventory home={activeHome} items={homeItems} rooms={homeRooms} onAddRoom={store.addRoom} onAddItem={store.addItem} onUpdateItem={store.updateItem} onDeleteItem={store.deleteItem} />}
      {page === 'finishes'     && <Finishes home={activeHome} finishes={homeFinishes} rooms={homeRooms} onAddFinish={store.addFinish} onUpdateFinish={store.updateFinish} onDeleteFinish={store.deleteFinish} />}
      {page === 'insurance'    && <Insurance home={activeHome} policies={homePolicies} items={homeItems} onAddPolicy={store.addPolicy} />}
      {page === 'maintenance'  && <Maintenance home={activeHome} logs={homeMaintenance} items={homeItems} onAddLog={store.addMaintenance} />}
      {page === 'renovations'  && <Renovations home={activeHome} renovations={homeRenovations} onAddRenovation={store.addRenovation} onUpdateRenovation={store.updateRenovation} />}
      {page === 'tradespeople' && <Tradespeople home={activeHome} tradespeople={homeTradespeople} onAddTradesperson={store.addTradesperson} onUpdateTradesperson={store.updateTradesperson} onDeleteTradesperson={store.deleteTradesperson} />}
      {page === 'emergency'    && <Emergency home={activeHome} policies={homePolicies} />}
    </div>
  )
}
