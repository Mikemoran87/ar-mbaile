import { useState } from 'react'
import type { Home, Tradesperson } from '../types'

const TRADES = ['Plumber', 'Electrician', 'Gas Engineer', 'Painter & Decorator', 'Carpenter / Joiner', 'Roofer', 'Tiler', 'Plasterer', 'Landscape Gardener', 'Builder / General Contractor', 'Cleaner', 'Other']

interface Props {
  home: Home
  tradespeople: Tradesperson[]
  onAddTradesperson: (t: Tradesperson) => void
  onUpdateTradesperson: (t: Tradesperson) => void
  onDeleteTradesperson: (id: string) => void
}

const empty = (): Partial<Tradesperson> => ({
  name: '', trade: 'Plumber', phone: '', email: '', website: '', lastUsed: '', rating: 5, notes: ''
})

const Stars = ({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" onClick={() => onChange?.(i)} className={onChange ? 'cursor-pointer' : 'cursor-default'}>
        <span className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      </button>
    ))}
  </div>
)

export function Tradespeople({ home, tradespeople, onAddTradesperson, onUpdateTradesperson, onDeleteTradesperson }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Tradesperson | null>(null)
  const [selected, setSelected] = useState<Tradesperson | null>(null)
  const [form, setForm] = useState<Partial<Tradesperson>>(empty())
  const [filterTrade, setFilterTrade] = useState('')

  const filtered = tradespeople.filter(t => !filterTrade || t.trade === filterTrade)
  const openAdd = () => { setForm(empty()); setEditItem(null); setShowForm(true); setSelected(null) }
  const openEdit = (t: Tradesperson) => { setForm({ ...t }); setEditItem(t); setShowForm(true); setSelected(null) }
  const handleSave = () => {
    if (!form.name) return
    if (editItem) {
      onUpdateTradesperson({ ...editItem, ...form } as Tradesperson)
    } else {
      onAddTradesperson({ ...form, id: crypto.randomUUID(), homeId: home.id, createdAt: new Date().toISOString() } as Tradesperson)
    }
    setShowForm(false); setEditItem(null)
  }

  if (selected) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => setSelected(null)} className="text-sm mb-6 flex items-center gap-1 opacity-60 hover:opacity-100">← Back</button>
      <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'white', border: '1px solid #E8E0D5' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>{selected.name}</h2>
            <p className="text-sm opacity-60">{selected.trade}</p>
            <div className="mt-1"><Stars rating={selected.rating} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEdit(selected)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#F0F7F4', color: '#1F3A32' }}>Edit</button>
            <button onClick={() => { onDeleteTradesperson(selected.id); setSelected(null) }} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#FFF0F0', color: '#6A1E2C' }}>Delete</button>
          </div>
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 mb-5">
          {selected.phone && (
            <a href={`tel:${selected.phone}`} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center text-white" style={{ background: '#1F3A32' }}>
              📞 Call
            </a>
          )}
          {selected.email && (
            <a href={`mailto:${selected.email}`} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center border" style={{ borderColor: '#E8E0D5', color: '#1F3A32' }}>
              ✉️ Email
            </a>
          )}
          {selected.website && (
            <a href={selected.website} target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-center border" style={{ borderColor: '#E8E0D5', color: '#1F3A32' }}>
              🔗 Website
            </a>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {selected.phone && <div className="flex items-center gap-2 py-2 border-b" style={{ borderColor: '#F0EBE3' }}><span className="opacity-50">📞</span><span>{selected.phone}</span></div>}
          {selected.email && <div className="flex items-center gap-2 py-2 border-b" style={{ borderColor: '#F0EBE3' }}><span className="opacity-50">✉️</span><span>{selected.email}</span></div>}
          {selected.lastUsed && <div className="flex items-center gap-2 py-2 border-b" style={{ borderColor: '#F0EBE3' }}><span className="opacity-50">📅</span><span>Last used: {new Date(selected.lastUsed).toLocaleDateString('en-IE')}</span></div>}
        </div>

        {selected.notes && <p className="text-sm opacity-70 italic mt-4">{selected.notes}</p>}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold" style={{ color: '#1F3A32' }}>Tradespeople</h2>
        <button onClick={openAdd} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1F3A32' }}>+ Add Contact</button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <select value={filterTrade} onChange={e => setFilterTrade(e.target.value)} className="border rounded-lg px-3 py-1.5 text-xs" style={{ borderColor: '#E8E0D5' }}>
          <option value="">All Trades</option>
          {TRADES.map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs opacity-50 self-center">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {tradespeople.length === 0 && !showForm && (
        <div className="text-center py-16 opacity-50">
          <div className="text-4xl mb-3">👷</div>
          <p className="text-sm">No tradespeople saved yet</p>
          <p className="text-xs mt-1">Never lose a good plumber's number again</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.sort((a, b) => b.rating - a.rating).map(t => (
          <button key={t.id} onClick={() => setSelected(t)}
            className="w-full text-left rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            style={{ background: 'white', border: '1px solid #E8E0D5' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ background: '#1F3A32' }}>
              {t.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: '#1F3A32' }}>{t.name}</div>
              <div className="text-xs opacity-50 mt-0.5">{t.trade}{t.lastUsed ? ` · Last used ${new Date(t.lastUsed).toLocaleDateString('en-IE')}` : ''}</div>
              <Stars rating={t.rating} />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {t.phone && <a href={`tel:${t.phone}`} onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#F0F7F4' }}>📞</a>}
            </div>
            <span className="opacity-30 text-lg">›</span>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: 'white' }}>
            <h3 className="font-display text-xl font-semibold mb-5" style={{ color: '#1F3A32' }}>{editItem ? 'Edit Contact' : 'Add Tradesperson'}</h3>
            <div className="space-y-3">
              <input placeholder="Name *" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <select value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }}>
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select>
              <input placeholder="Phone" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <input placeholder="Email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <input placeholder="Website" value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} />
              <div><label className="text-xs opacity-50 block mb-1">Last Used</label><input type="date" value={form.lastUsed || ''} onChange={e => setForm(f => ({ ...f, lastUsed: e.target.value }))} className="w-full border rounded-xl px-4 py-2.5 text-sm" style={{ borderColor: '#E8E0D5' }} /></div>
              <div>
                <label className="text-xs opacity-50 font-semibold uppercase tracking-wide block mb-2">Rating</label>
                <Stars rating={form.rating || 5} onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <textarea placeholder="Notes (e.g. Fixed boiler Jan 2024, charged €180, very reliable)" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none" style={{ borderColor: '#E8E0D5' }} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: '#E8E0D5' }}>Cancel</button>
                <button onClick={handleSave} disabled={!form.name} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{ background: '#1F3A32' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
