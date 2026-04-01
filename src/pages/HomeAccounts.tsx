import { useState } from 'react'
import type { Home, HomeAccount } from '../types'

const CATEGORIES = [
  'Broadband / WiFi',
  'Electricity',
  'Gas',
  'Water',
  'Home Security / Alarm',
  'Sky / Satellite TV',
  'Streaming (Netflix, Disney+...)',
  'Smart Home (Hue, Nest...)',
  'Mortgage / Rent',
  'Management Company',
  'Bin Collection',
  'Other',
]

const CAT_ICONS: Record<string, string> = {
  'Broadband / WiFi': '📶',
  'Electricity': '⚡',
  'Gas': '🔥',
  'Water': '💧',
  'Home Security / Alarm': '🔐',
  'Sky / Satellite TV': '📡',
  'Streaming (Netflix, Disney+...)': '🎬',
  'Smart Home (Hue, Nest...)': '💡',
  'Mortgage / Rent': '🏦',
  'Management Company': '🏢',
  'Bin Collection': '🗑️',
  'Other': '📋',
}

interface Props {
  home: Home
  accounts: HomeAccount[]
  onAddAccount: (a: HomeAccount) => void
  onUpdateAccount: (a: HomeAccount) => void
  onDeleteAccount: (id: string) => void
}

const empty = (): Partial<HomeAccount> => ({
  category: 'Broadband / WiFi',
  provider: '', accountNumber: '', username: '',
  password: '', phone: '', website: '', notes: '',
})

export function HomeAccounts({ home, accounts, onAddAccount, onUpdateAccount, onDeleteAccount }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<HomeAccount | null>(null)
  const [selected, setSelected] = useState<HomeAccount | null>(null)
  const [form, setForm] = useState<Partial<HomeAccount>>(empty())
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [filterCat, setFilterCat] = useState('')

  const filtered = accounts.filter(a => !filterCat || a.category === filterCat)

  const openAdd = () => { setForm(empty()); setEditItem(null); setShowForm(true); setSelected(null) }
  const openEdit = (a: HomeAccount) => { setForm({ ...a }); setEditItem(a); setShowForm(true); setSelected(null) }

  const handleSave = () => {
    if (!form.provider && !form.category) return
    if (editItem) {
      onUpdateAccount({ ...editItem, ...form } as HomeAccount)
      setSelected({ ...editItem, ...form } as HomeAccount)
    } else {
      onAddAccount({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as HomeAccount)
    }
    setShowForm(false); setEditItem(null)
  }

  const togglePassword = (id: string) => setShowPasswords(p => ({ ...p, [id]: !p[id] }))

  // Detail view
  if (selected) {
    const showPw = showPasswords[selected.id]
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back to Accounts</button>
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{CAT_ICONS[selected.category] || '📋'}</span>
              <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>{selected.provider || selected.category}</h2>
                <p className="text-sm opacity-60">{selected.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#F0F7F4', color: '#1F3A32' }}>Edit</button>
              <button onClick={() => { onDeleteAccount(selected.id); setSelected(null) }} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#FFF0F0', color: '#6A1E2C' }}>Delete</button>
            </div>
          </div>

          <div className="space-y-0 divide-y" style={{ borderColor: '#F0EBE3' }}>
            {selected.accountNumber && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">Account Number</span>
                <span className="font-mono font-semibold text-sm">{selected.accountNumber}</span>
              </div>
            )}
            {selected.username && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">Username / Email</span>
                <span className="font-mono text-sm">{selected.username}</span>
              </div>
            )}
            {selected.password && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{showPw ? selected.password : '••••••••'}</span>
                  <button onClick={() => togglePassword(selected.id)} className="text-xs font-semibold opacity-50 hover:opacity-100" style={{ color: '#1F3A32' }}>
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}
            {selected.phone && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">Phone / Support</span>
                <a href={`tel:${selected.phone}`} className="font-semibold text-sm" style={{ color: '#1F3A32' }}>{selected.phone}</a>
              </div>
            )}
            {selected.website && (
              <div className="flex items-center justify-between py-3">
                <span className="text-xs opacity-50 font-semibold uppercase tracking-wide">Website</span>
                <a href={selected.website} target="_blank" rel="noreferrer" className="text-sm font-semibold truncate max-w-[200px]" style={{ color: '#C9A86A' }}>
                  {selected.website.replace(/^https?:\/\//, '').split('/')[0]} ↗
                </a>
              </div>
            )}
          </div>

          {/* WiFi-specific: show password prominently */}
          {selected.category === 'Broadband / WiFi' && selected.password && (
            <div className="mt-4 p-4 rounded-xl text-center" style={{ background: '#F0F7F4', border: '1px solid #A9C1A9' }}>
              <div className="text-xs opacity-60 font-semibold uppercase tracking-wide mb-1">📶 WiFi Password</div>
              <div className="font-mono text-lg font-bold" style={{ color: '#1F3A32' }}>
                {showPw ? selected.password : '••••••••••'}
              </div>
              <button onClick={() => togglePassword(selected.id)} className="text-xs font-semibold mt-2 opacity-60 hover:opacity-100">
                {showPw ? 'Hide' : 'Tap to reveal'}
              </button>
            </div>
          )}

          {selected.notes && <p className="text-sm opacity-70 italic mt-4">{selected.notes}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>Home Accounts</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>+ Add Account</button>
      </div>
      <p className="text-xs opacity-50 mb-6">WiFi, utilities, TV, alarm codes — all in one place. Protected by your PIN.</p>

      <div className="flex gap-2 flex-wrap mb-6">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{ borderColor: '#E8E0D5' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-xs opacity-50 self-center">{filtered.length} account{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">🔑</div>
          <p className="text-sm">No accounts saved yet</p>
          <p className="text-xs mt-1">Save your WiFi password, utility accounts, alarm codes</p>
        </div>
      )}

      {/* Grouped by category */}
      {CATEGORIES.filter(c => !filterCat || c === filterCat).map(cat => {
        const group = filtered.filter(a => a.category === cat)
        if (!group.length) return null
        return (
          <div key={cat} className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-40">{CAT_ICONS[cat]} {cat}</h3>
            <div className="space-y-2">
              {group.map(a => (
                <button key={a.id} onClick={() => setSelected(a)}
                  className="w-full text-left rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                  style={{ background: 'white', border: '1px solid #E8E0D5' }}>
                  <span className="text-xl">{CAT_ICONS[a.category] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: '#1F3A32' }}>{a.provider || a.category}</div>
                    <div className="text-xs opacity-50 mt-0.5">
                      {a.accountNumber ? `Acc: ${a.accountNumber}` : ''}
                      {a.username ? `${a.accountNumber ? ' · ' : ''}${a.username}` : ''}
                      {a.password ? ' · 🔒 Password saved' : ''}
                    </div>
                  </div>
                  <span className="opacity-30 text-lg">›</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{ color: '#1F3A32' }}>{editItem ? 'Edit Account' : 'Add Account'}</h3>
            <div className="space-y-3">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Provider name (e.g. Eir, Electric Ireland)" value={form.provider || ''} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <input placeholder="Account number / Customer number" value={form.accountNumber || ''} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <input placeholder="Username / Email / WiFi network name" value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <div className="relative">
                <input
                  type={showPasswords['form'] ? 'text' : 'password'}
                  placeholder="Password / PIN / WiFi password / Alarm code"
                  value={form.password || ''}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm pr-16"
                  style={{ borderColor: '#E8E0D5' }}
                />
                <button type="button" onClick={() => togglePassword('form')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold opacity-50 hover:opacity-100">
                  {showPasswords['form'] ? 'Hide' : 'Show'}
                </button>
              </div>
              <input placeholder="Customer support phone number" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <input placeholder="Website / Login URL" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <textarea placeholder="Notes (e.g. router is in the hotpress, account name is Katie's email...)" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />

              <div className="p-3 rounded-xl text-xs" style={{ background: '#FFF8F0', border: '1px solid #FCD34D20' }}>
                ⚠️ Passwords are stored locally in your browser. Set up a PIN (Emergency tab) before saving sensitive credentials.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
