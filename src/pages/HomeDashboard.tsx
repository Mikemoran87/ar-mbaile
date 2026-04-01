import type { Home, Item, InsurancePolicy, MaintenanceLog, Room } from '../types'

type Page = 'dashboard' | 'inventory' | 'insurance' | 'maintenance' | 'emergency'

interface Props {
  home: Home
  items: Item[]
  policies: InsurancePolicy[]
  maintenance: MaintenanceLog[]
  rooms: Room[]
  onNavigate: (p: Page) => void
}

export function HomeDashboard({ home, items, policies, maintenance, onNavigate }: Props) {
  const totalValue = items.reduce((sum, i) => sum + (parseFloat(i.purchasePrice) || 0), 0)
  const highValueItems = items.filter(i => i.isHighValue).length
  const today = new Date()
  const in60days = new Date(); in60days.setDate(today.getDate() + 60)

  const expiringPolicies = policies.filter(p => {
    if (!p.renewalDate) return false
    const d = new Date(p.renewalDate)
    return d <= in60days && d >= today
  })

  const overdueMaintenance = maintenance.filter(m => {
    if (!m.nextDueDate) return false
    return new Date(m.nextDueDate) < today
  })

  const upcomingMaintenance = maintenance.filter(m => {
    if (!m.nextDueDate) return false
    const d = new Date(m.nextDueDate)
    const in30 = new Date(); in30.setDate(today.getDate() + 30)
    return d >= today && d <= in30
  })

  const warrantyExpiringSoon = items.filter(i => {
    if (!i.warrantyExpiry) return false
    const d = new Date(i.warrantyExpiry)
    return d <= in60days && d >= today
  })

  const stats = [
    { label: 'Total Items', value: items.length, icon: '📦', color: '#1F3A32', page: 'inventory' as Page },
    { label: 'Inventory Value', value: `€${totalValue.toLocaleString('en-IE', {minimumFractionDigits:0})}`, icon: '💰', color: '#C9A86A', page: 'inventory' as Page },
    { label: 'Policies Expiring Soon', value: expiringPolicies.length, icon: '🛡️', color: expiringPolicies.length > 0 ? '#6A1E2C' : '#1F3A32', page: 'insurance' as Page },
    { label: 'Maintenance Due', value: overdueMaintenance.length, icon: '🔧', color: overdueMaintenance.length > 0 ? '#6A1E2C' : '#1F3A32', page: 'maintenance' as Page },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8 flex items-center gap-4">
        <span className="text-5xl">{home.coverEmoji}</span>
        <div>
          <h2 className="font-display text-3xl font-bold" style={{color:'#1F3A32'}}>{home.name}</h2>
          {home.address && <p className="text-sm opacity-60">{home.address}</p>}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map(s => (
          <button key={s.label} onClick={() => onNavigate(s.page)}
            className="text-left rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            style={{background:'white', border:'1px solid #E8E0D5'}}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold mb-1" style={{color: s.color}}>{s.value}</div>
            <div className="text-xs opacity-60 font-medium">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Alerts */}
      {(expiringPolicies.length > 0 || overdueMaintenance.length > 0 || warrantyExpiringSoon.length > 0) && (
        <div className="mb-8 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">Alerts</h3>
          {expiringPolicies.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{background:'#FFF8F0', border:'1px solid #F59E0B20'}}>
              <span>🛡️</span>
              <span><strong>{p.type} insurance</strong> with {p.provider} renews {new Date(p.renewalDate).toLocaleDateString('en-IE')}</span>
            </div>
          ))}
          {overdueMaintenance.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{background:'#FFF0F0', border:'1px solid #EF444420'}}>
              <span>🔧</span>
              <span><strong>{m.title}</strong> was due {new Date(m.nextDueDate).toLocaleDateString('en-IE')}</span>
            </div>
          ))}
          {warrantyExpiringSoon.map(i => (
            <div key={i.id} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{background:'#FFF8F0', border:'1px solid #F59E0B20'}}>
              <span>📋</span>
              <span><strong>{i.name}</strong> warranty expires {new Date(i.warrantyExpiry).toLocaleDateString('en-IE')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick nav */}
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-50">Quick Access</h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '📦', label: 'Inventory', sub: `${items.length} items · ${highValueItems} high value`, page: 'inventory' as Page },
          { icon: '🛡️', label: 'Insurance Vault', sub: `${policies.length} policies`, page: 'insurance' as Page },
          { icon: '🔧', label: 'Maintenance', sub: upcomingMaintenance.length > 0 ? `${upcomingMaintenance.length} due soon` : `${maintenance.length} logs`, page: 'maintenance' as Page },
          { icon: '🚨', label: 'Emergency Info', sub: 'Contacts & shutoffs', page: 'emergency' as Page },
        ].map(n => (
          <button key={n.label} onClick={() => onNavigate(n.page)}
            className="text-left rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            style={{background:'white', border:'1px solid #E8E0D5'}}
          >
            <div className="text-2xl mb-2">{n.icon}</div>
            <div className="font-semibold text-sm mb-0.5" style={{color:'#1F3A32'}}>{n.label}</div>
            <div className="text-xs opacity-50">{n.sub}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
